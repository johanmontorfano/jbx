use jbx::switch::Switch;
use std::collections::HashMap;

/// If making a Switch is not possible, the test would just fail.
#[test]
fn make_switch() {
    Switch::<String, u32>::make(10_u32);
}

#[test]
fn test_switch_statement() {
    let result = Switch::<String, u32>::make(3_u32)
        .case(1_u32, || { Some("1".into()) })
        .case(2_u32, || { Some("2".into()) })
        .case(3_u32, || { Some("3".into()) })
        .result.unwrap();
    assert_eq!(String::from("3"), result);
}

#[test]
fn test_default_statement() {
    let result = Switch::<String, u32>::make(4_u32)
        .case(1_u32, || { Some("1".into()) })
        .case(2_u32, || { Some("2".into()) })
        .case(3_u32, || { Some("3".into()) }) 
        .default(|| { Some("X".into()) })
        .unwrap();
    assert_eq!(String::from("X"), result);
}

#[test]
fn test_hash_map_switch_with_default() {
    let hashmap_test: HashMap<u32, String> = HashMap::from([
        (1, "1".into()),
        (2, "2".into()),
        (3, "3".into())
    ]);

    let result = Switch::<String, u32>::make(3_u32)
        .into_hash_map_switch(hashmap_test)
        .default(|| { Some("X".into()) })
        .unwrap();
    assert_eq!(String::from("3"), result);
}
