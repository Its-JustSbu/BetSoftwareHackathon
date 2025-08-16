import { User } from "./user";

export class Wallet {
    id!: string;
    owner!: User;
    name!: string;
    balance!: number;
    created_at!: Date;
    updated_at!: Date;
    is_active!: boolean;
}

export class walletView {
    username!: string;
}

export class deposit {
    name!: string;
    description!: string;
}

export class transaction {
    id!: string;
    wallet!: string;
    wallet_owner!: string;
    status: string = 'PENDING';
    amount!: number;
    transaction_type: string = 'DEPOSIT';
    description!: string;
    created_at!: Date;
    updated_at!: Date;
    reference_id!: string;
    related_wallet!: string;
    related_wallet_owner!: string;
}

export class transfer {
    recipient_waller_id!: string;
    amount!: string;
    description!: string;
}