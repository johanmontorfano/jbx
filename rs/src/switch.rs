pub struct Switch<R, V: PartialEq> {
    pub value: V,
    pub result: Option<R>
}

/// Works similar to a JavaScript switch...case statement.
impl<R, V: PartialEq> Switch<R, V> {
    pub fn make(value: V) -> Self {
        Self { value, result: None }
    }

    pub fn into_hash_map_switch(
        &self, hash_map: HashMap<V, Option<R>>
    ) -> HashMapSwitch<R, V> {
        HashMapSwitch::make(self.value)
            .hash_case(hash_map)
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

/// Works similar to `Switch`, but every `case` statement is replaced by a 
/// HashMap checking. Thus, HashMapSwitch<R, V> requires HashMap<V, Option<R>>.
/// 
/// Using `default` is still possible with this Switch type.
impl <R, V: PartialEq> HashMapSwitch<R, V> {
    pub fn make(value: V) -> Self {
        Self { value, result: None }
    }

    pub fn hash_case(&self, hash_map: HashMap<V, Option<R>>) -> Self {
        hash_map
            .into_iter()
            .for_each(|v: (V, Option<R>)| {
                if v.0 == self.value { self.result = v.1 }
            });
    }

    /// Runs if result is still `None`. And return the result.
    pub fn default<F: FnOnce() -> Option<R>>(mut self, r: F) -> Option<R> {
        if self.result.is_none() { self.result = r(); }
        return self.result;
    }
}
