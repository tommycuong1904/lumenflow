#![no_std]

#[cfg(test)]
extern crate std;

use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, Symbol};

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
    pub status: EscrowStatus,
}

#[contract]
pub struct EscrowVaultContract;

#[contractimpl]
impl EscrowVaultContract {
    pub fn create_escrow(env: Env, payer: Address, payee: Address, amount: i128) -> u64 {
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

        let escrow = EscrowRecord {
            id: next_id,
            payer,
            payee,
            amount,
            status: EscrowStatus::Created,
        };

        env.storage()
            .persistent()
            .set(&DataKey::Escrow(next_id), &escrow);
        env.storage().persistent().set(&ESCROW_COUNTER, &next_id);

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

        escrow.status = EscrowStatus::Released;
        env.storage()
            .persistent()
            .set(&DataKey::Escrow(id), &escrow);
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

        escrow.status = EscrowStatus::Refunded;
        env.storage()
            .persistent()
            .set(&DataKey::Escrow(id), &escrow);
    }

    pub fn get_escrow(env: Env, id: u64) -> EscrowRecord {
        env.storage()
            .persistent()
            .get(&DataKey::Escrow(id))
            .unwrap_or_else(|| panic!("escrow not found"))
    }
}

#[cfg(test)]
mod tests {
    use super::{EscrowStatus, EscrowVaultContract, EscrowVaultContractClient};
    use soroban_sdk::{testutils::Address as _, Address, Env};

    #[test]
    fn create_escrow_persists_created_state() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register(EscrowVaultContract, ());
        let client = EscrowVaultContractClient::new(&env, &contract_id);
        let payer = Address::generate(&env);
        let payee = Address::generate(&env);

        let escrow_id = client.create_escrow(&payer, &payee, &250_i128);
        let escrow = client.get_escrow(&escrow_id);

        assert_eq!(escrow.id, 1);
        assert_eq!(escrow.payer, payer);
        assert_eq!(escrow.payee, payee);
        assert_eq!(escrow.amount, 250);
        assert_eq!(escrow.status, EscrowStatus::Created);
    }

    #[test]
    fn release_escrow_updates_status() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register(EscrowVaultContract, ());
        let client = EscrowVaultContractClient::new(&env, &contract_id);
        let payer = Address::generate(&env);
        let payee = Address::generate(&env);

        let escrow_id = client.create_escrow(&payer, &payee, &250_i128);
        client.release_escrow(&escrow_id, &payer);

        let escrow = client.get_escrow(&escrow_id);
        assert_eq!(escrow.status, EscrowStatus::Released);
    }

    #[test]
    fn refund_escrow_updates_status() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register(EscrowVaultContract, ());
        let client = EscrowVaultContractClient::new(&env, &contract_id);
        let payer = Address::generate(&env);
        let payee = Address::generate(&env);

        let escrow_id = client.create_escrow(&payer, &payee, &250_i128);
        client.refund_escrow(&escrow_id, &payer);

        let escrow = client.get_escrow(&escrow_id);
        assert_eq!(escrow.status, EscrowStatus::Refunded);
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

        let _ = client.create_escrow(&payer, &payee, &0_i128);
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

        let escrow_id = client.create_escrow(&payer, &payee, &250_i128);
        client.release_escrow(&escrow_id, &payer);
        client.release_escrow(&escrow_id, &payer);
    }
}
