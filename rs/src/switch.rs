pub struct Switch<R, V: PartialEq> {
    pub value: V,
    pub result: Option<R>
}

/// Works similar to a JavaScript switch...case statement.
impl<R, V: PartialEq> Switch<R, V> {
    pub fn make(value: V) -> Self {
        Self { value, result: None }
    }

    /// Runs a closure if the provided value matches the switch value.
    pub fn case<F: FnOnce() -> Option<R>>(
        mut self, 
        comp: V, r: F
    ) -> Self {
        if comp == self.value { self.result = r(); }
        return self;
    }

    /// Runs if result is still `None`. And return the result.
    pub fn default<F: FnOnce() -> Option<R>>(mut self, r: F) -> Option<R> {
        if self.result.is_none() { self.result = r(); }
        return self.result;
    }
}
