#![no_std]

#[cfg(test)]
extern crate std;

use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, String, Symbol};

const EVENT_ESCROW_CREATED: Symbol = symbol_short!("created");
const EVENT_ESCROW_RELEASED: Symbol = symbol_short!("released");
const EVENT_ESCROW_REFUNDED: Symbol = symbol_short!("refunded");

const ESCROW_COUNTER: Symbol = symbol_short!("ESCROW");

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Escrow(u64),
}

#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub enum EscrowStatus {
    Created,
    Released,
    Refunded,
}

#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub struct EscrowRecord {
    pub id: u64,
    pub payer: Address,
    pub payee: Address,
    pub amount: i128,
    pub memo: String,
    pub status: EscrowStatus,
    pub created_at: u64,
    pub updated_at: u64,
}

#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub struct EscrowReadModel {
    pub id: u64,
    pub payer: Address,
    pub payee: Address,
    pub amount: i128,
    pub memo: String,
    pub status: EscrowStatus,
    pub created_at: u64,
    pub updated_at: u64,
}

#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub struct EscrowEvent {
    pub escrow_id: u64,
    pub payer: Address,
    pub payee: Address,
    pub amount: i128,
    pub memo: String,
    pub status: EscrowStatus,
    pub timestamp: u64,
}

#[contract]
pub struct EscrowVaultContract;

#[contractimpl]
impl EscrowVaultContract {
    pub fn create_escrow(
        env: Env,
        payer: Address,
        payee: Address,
        amount: i128,
        memo: String,
    ) -> u64 {
        payer.require_auth();

        if amount <= 0 {
            panic!("amount must be positive");
        }

        let next_id = env
            .storage()
            .persistent()
            .get::<_, u64>(&ESCROW_COUNTER)
            .unwrap_or(0)
            + 1;

        let now = env.ledger().timestamp();
        let escrow = EscrowRecord {
            id: next_id,
            payer: payer.clone(),
            payee: payee.clone(),
            amount,
            memo: memo.clone(),
            status: EscrowStatus::Created,
            created_at: now,
            updated_at: now,
        };

        env.storage()
            .persistent()
            .set(&DataKey::Escrow(next_id), &escrow);
        env.storage().persistent().set(&ESCROW_COUNTER, &next_id);
        env.events().publish(
            (EVENT_ESCROW_CREATED, next_id),
            EscrowEvent {
                escrow_id: next_id,
                payer,
                payee,
                amount,
                memo,
                status: EscrowStatus::Created,
                timestamp: now,
            },
        );

        next_id
    }

    pub fn release_escrow(env: Env, id: u64, payer: Address) {
        payer.require_auth();

        let mut escrow = Self::get_escrow(env.clone(), id);
        if escrow.payer != payer {
            panic!("payer mismatch");
        }
        if escrow.status != EscrowStatus::Created {
            panic!("escrow not releasable");
        }

        let now = env.ledger().timestamp();
        escrow.status = EscrowStatus::Released;
        escrow.updated_at = now;
        env.storage()
            .persistent()
            .set(&DataKey::Escrow(id), &escrow);
        env.events().publish(
            (EVENT_ESCROW_RELEASED, id),
            EscrowEvent {
                escrow_id: id,
                payer: escrow.payer,
                payee: escrow.payee,
                amount: escrow.amount,
                memo: escrow.memo.clone(),
                status: EscrowStatus::Released,
                timestamp: now,
            },
        );
    }

    pub fn refund_escrow(env: Env, id: u64, payer: Address) {
        payer.require_auth();

        let mut escrow = Self::get_escrow(env.clone(), id);
        if escrow.payer != payer {
            panic!("payer mismatch");
        }
        if escrow.status != EscrowStatus::Created {
            panic!("escrow not refundable");
        }

        let now = env.ledger().timestamp();
        escrow.status = EscrowStatus::Refunded;
        escrow.updated_at = now;
        env.storage()
            .persistent()
            .set(&DataKey::Escrow(id), &escrow);
        env.events().publish(
            (EVENT_ESCROW_REFUNDED, id),
            EscrowEvent {
                escrow_id: id,
                payer: escrow.payer,
                payee: escrow.payee,
                amount: escrow.amount,
                memo: escrow.memo.clone(),
                status: EscrowStatus::Refunded,
                timestamp: now,
            },
        );
    }

    pub fn get_escrow(env: Env, id: u64) -> EscrowRecord {
        env.storage()
            .persistent()
            .get(&DataKey::Escrow(id))
            .unwrap_or_else(|| panic!("escrow not found"))
    }

    pub fn get_escrow_read_model(env: Env, id: u64) -> EscrowReadModel {
        let escrow = Self::get_escrow(env, id);
        EscrowReadModel {
            id: escrow.id,
            payer: escrow.payer,
            payee: escrow.payee,
            amount: escrow.amount,
            memo: escrow.memo,
            status: escrow.status,
            created_at: escrow.created_at,
            updated_at: escrow.updated_at,
        }
    }

    pub fn get_escrow_count(env: Env) -> u64 {
        env.storage()
            .persistent()
            .get::<_, u64>(&ESCROW_COUNTER)
            .unwrap_or(0)
    }
}

#[cfg(test)]
mod tests {
    extern crate std;

    use super::{EscrowStatus, EscrowVaultContract, EscrowVaultContractClient};
    use soroban_sdk::{testutils::{Address as _, Ledger}, Address, Env, String};

    #[test]
    fn create_escrow_persists_created_state() {
        let env = Env::default();
        env.mock_all_auths();
        env.ledger().set_timestamp(1_700_000_000);

        let contract_id = env.register(EscrowVaultContract, ());
        let client = EscrowVaultContractClient::new(&env, &contract_id);
        let payer = Address::generate(&env);
        let payee = Address::generate(&env);
        let memo = String::from_str(&env, "Milestone 1");

        let escrow_id = client.create_escrow(&payer, &payee, &250_i128, &memo);
        let escrow = client.get_escrow(&escrow_id);
        let read_model = client.get_escrow_read_model(&escrow_id);

        assert_eq!(escrow.id, 1);
        assert_eq!(read_model.id, 1);
        assert_eq!(escrow.payer, payer.clone());
        assert_eq!(escrow.payee, payee.clone());
        assert_eq!(escrow.amount, 250);
        assert_eq!(escrow.memo, String::from_str(&env, "Milestone 1"));
        assert_eq!(escrow.status, EscrowStatus::Created);
        assert_eq!(escrow.created_at, 1_700_000_000);
        assert_eq!(escrow.updated_at, 1_700_000_000);
        assert_eq!(client.get_escrow_count(), 1);
    }

    #[test]
    fn release_escrow_updates_status() {
        let env = Env::default();
        env.mock_all_auths();
        env.ledger().set_timestamp(1_700_000_000);

        let contract_id = env.register(EscrowVaultContract, ());
        let client = EscrowVaultContractClient::new(&env, &contract_id);
        let payer = Address::generate(&env);
        let payee = Address::generate(&env);
        let memo = String::from_str(&env, "Milestone 1");

        let escrow_id = client.create_escrow(&payer, &payee, &250_i128, &memo);
        env.ledger().set_timestamp(1_700_000_123);
        client.release_escrow(&escrow_id, &payer);

        let escrow = client.get_escrow(&escrow_id);
        assert_eq!(escrow.status, EscrowStatus::Released);
        assert_eq!(escrow.created_at, 1_700_000_000);
        assert_eq!(escrow.updated_at, 1_700_000_123);
    }

    #[test]
    fn refund_escrow_updates_status() {
        let env = Env::default();
        env.mock_all_auths();
        env.ledger().set_timestamp(1_700_000_000);

        let contract_id = env.register(EscrowVaultContract, ());
        let client = EscrowVaultContractClient::new(&env, &contract_id);
        let payer = Address::generate(&env);
        let payee = Address::generate(&env);
        let memo = String::from_str(&env, "Milestone 1");

        let escrow_id = client.create_escrow(&payer, &payee, &250_i128, &memo);
        env.ledger().set_timestamp(1_700_000_456);
        client.refund_escrow(&escrow_id, &payer);

        let escrow = client.get_escrow(&escrow_id);
        assert_eq!(escrow.status, EscrowStatus::Refunded);
        assert_eq!(escrow.created_at, 1_700_000_000);
        assert_eq!(escrow.updated_at, 1_700_000_456);
    }

    #[test]
    #[should_panic(expected = "amount must be positive")]
    fn create_escrow_rejects_non_positive_amount() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register(EscrowVaultContract, ());
        let client = EscrowVaultContractClient::new(&env, &contract_id);
        let payer = Address::generate(&env);
        let payee = Address::generate(&env);
        let memo = String::from_str(&env, "Invalid amount");

        let _ = client.create_escrow(&payer, &payee, &0_i128, &memo);
    }

    #[test]
    #[should_panic(expected = "escrow not releasable")]
    fn released_escrow_cannot_be_released_twice() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register(EscrowVaultContract, ());
        let client = EscrowVaultContractClient::new(&env, &contract_id);
        let payer = Address::generate(&env);
        let payee = Address::generate(&env);
        let memo = String::from_str(&env, "Milestone 1");

        let escrow_id = client.create_escrow(&payer, &payee, &250_i128, &memo);
        client.release_escrow(&escrow_id, &payer);
        client.release_escrow(&escrow_id, &payer);
    }

    #[test]
    #[should_panic(expected = "payer mismatch")]
    fn refund_escrow_rejects_non_owner() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register(EscrowVaultContract, ());
        let client = EscrowVaultContractClient::new(&env, &contract_id);
        let payer = Address::generate(&env);
        let payee = Address::generate(&env);
        let stranger = Address::generate(&env);
        let memo = String::from_str(&env, "Refund guard");

        let escrow_id = client.create_escrow(&payer, &payee, &250_i128, &memo);
        client.refund_escrow(&escrow_id, &stranger);
    }
}
