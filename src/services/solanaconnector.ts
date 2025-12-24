import {
    Connection,
    PublicKey,
    Transaction,
    Keypair,
    sendAndConfirmTransaction,
} from "@solana/web3.js";
import { Program, AnchorProvider, Wallet } from "@coral-xyz/anchor";
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import * as anchor from "@coral-xyz/anchor";
import raffleIdl from "../types/raffle.json";
import dotenv from "dotenv";
dotenv.config();

const connection = new Connection(
    process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com",
    "confirmed"
);
const RAFFLE_ADMIN_KEYPAIR = Keypair.fromSecretKey(
    Uint8Array.from(JSON.parse(process.env.RAFFLE_ADMIN_PRIVATE_KEY || "[]"))
);

const wallet = new Wallet(RAFFLE_ADMIN_KEYPAIR);
const provider = new AnchorProvider(connection, wallet, {
    commitment: "confirmed",
});

const RAFFLE_PROGRAM_ID = new anchor.web3.PublicKey(raffleIdl.address);
const raffleProgram = new Program(raffleIdl as anchor.Idl, provider);

const FAKE_MINT = new PublicKey("So11111111111111111111111111111111111111112");
const FAKE_ATA = new PublicKey("B9W4wPFWjTbZ9ab1okzB4D3SsGY7wntkrBKwpp5RC1Uv");

function rafflePda(raffleId: number): PublicKey {
    const idBuffer = Buffer.alloc(4);
    idBuffer.writeUInt32LE(raffleId);

    const [pda] = PublicKey.findProgramAddressSync(
        [Buffer.from("raffle"), idBuffer],
        RAFFLE_PROGRAM_ID
    );
    return pda;
}

function getRaffleConfigPda(): PublicKey {
    const [pda] = PublicKey.findProgramAddressSync(
        [Buffer.from("raffle_config")],
        RAFFLE_PROGRAM_ID
    );
    return pda;
}

async function getTokenProgramFromMint(
    connection: Connection,
    mint: PublicKey
): Promise<PublicKey> {
    const accountInfo = await connection.getAccountInfo(mint);
    
    if (!accountInfo) {
        throw new Error("Mint account not found");
    }

    const TOKEN_2022_PROGRAM_ID = new PublicKey(
        "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
    );
    
    if (accountInfo.owner.equals(TOKEN_2022_PROGRAM_ID)) {
        return TOKEN_2022_PROGRAM_ID;
    }
    
    return TOKEN_PROGRAM_ID;
}

async function ensureAtaIx(params: {
    connection: Connection;
    mint: PublicKey;
    owner: PublicKey;
    payer: PublicKey;
    tokenProgram: PublicKey;
    allowOwnerOffCurve?: boolean;
}): Promise<{ ata: PublicKey; ix: any | null }> {
    const { connection, mint, owner, payer, tokenProgram, allowOwnerOffCurve } = params;

    const ata = await getAssociatedTokenAddress(
        mint,
        owner,
        allowOwnerOffCurve,
        tokenProgram
    );

    const accountInfo = await connection.getAccountInfo(ata);

    if (accountInfo) {
        return { ata, ix: null };
    }

    const { createAssociatedTokenAccountInstruction } = await import("@solana/spl-token");
    
    const ix = createAssociatedTokenAccountInstruction(
        payer,
        ata,
        owner,
        mint,
        tokenProgram
    );

    return { ata, ix };
}

async function announceWinners(
    args: {
        raffleId: number;
        winners: PublicKey[];
    }
): Promise<string> {
    try {
        const tx = new Transaction();

        const raffleAccountPda = rafflePda(args.raffleId);
        const raffleConfigPda = getRaffleConfigPda();

        const raffleData = await (raffleProgram.account as any).raffle.fetch(
            raffleAccountPda
        );

        const ticketMint = raffleData.ticketMint ?? FAKE_MINT;

        const ticketTokenProgram = await getTokenProgramFromMint(
            connection,
            ticketMint
        );

        let ticketEscrow = FAKE_ATA;
        let ticketFeeTreasury = FAKE_ATA;

        if (raffleData.ticketMint !== null) {
            const escrowRes = await ensureAtaIx({
                connection,
                mint: ticketMint,
                owner: raffleAccountPda,
                payer: RAFFLE_ADMIN_KEYPAIR.publicKey,
                tokenProgram: ticketTokenProgram,
                allowOwnerOffCurve: true,
            });

            ticketEscrow = escrowRes.ata;
            if (escrowRes.ix) tx.add(escrowRes.ix);

            const treasuryRes = await ensureAtaIx({
                connection,
                mint: ticketMint,
                owner: raffleConfigPda,
                payer: RAFFLE_ADMIN_KEYPAIR.publicKey,
                tokenProgram: ticketTokenProgram,
                allowOwnerOffCurve: true,
            });

            ticketFeeTreasury = treasuryRes.ata;
            if (treasuryRes.ix) tx.add(treasuryRes.ix);
        }

        const ix = await raffleProgram.methods
            .announceWinners(args.raffleId, args.winners)
            .accounts({
                raffleAdmin: RAFFLE_ADMIN_KEYPAIR.publicKey,
                ticketMint,
                ticketEscrow,
                ticketFeeTreasury,
                ticketTokenProgram,
            })
            .instruction();

        tx.add(ix);

        const signature = await sendAndConfirmTransaction(
            connection,
            tx,
            [RAFFLE_ADMIN_KEYPAIR],
            { commitment: "confirmed" }
        );

        console.log("Winners announced:", signature);
        return signature;

    } catch (error) {
        console.error("Announce winners failed:", error);
        throw error;
    }
}

export { announceWinners, connection, provider, RAFFLE_ADMIN_KEYPAIR };