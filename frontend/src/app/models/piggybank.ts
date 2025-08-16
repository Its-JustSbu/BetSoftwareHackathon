import { User } from "./user";

export class member{
    usename!: string;
}

export class piggyBanks {
    id!: string;
    description!: string;
    creator!: User;
    target_amount!: string;
    current_amount!: string;
    progress_percentage!: string;
    is_target_reached!: string;
    memberss_count!: string;
    contributions_count!: string;
    is_active!: boolean;
    created_at!: Date;
    updated_at!: Date;
}

export class piggyBankView {
    name!: string;
    description!: string;
    target_amount!: string;
}

export class contribute {
    wallet_id!: string;
    amount!: string;
}

export class contributions {
    id!: string;
    piggy_bank!: string;
    piggy_bank_name!: string;
    contributor!: User;
    amount!: string;
    wallet!: string;
    created_at!: Date;
    updated_at!: Date;
}

export class members {
    id!: string;
    piggy_bank!: string;
    piggy_bank_name!: string;
    user!: User;
    invited_at!: Date;
    joined_at!: Date;
    is_active!: boolean;
    created_at!: Date;
    updated_at!: Date;
}