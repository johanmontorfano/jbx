use jbx::switch::Switch;

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
