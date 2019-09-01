# TypeScript prototyping for a Solid server
This repository contains interfaces, components, and tests
to inform the design of a [Solid](https://github.com/solid/solid-spec/) server
in TypeScript.

**Status: Archived**

This repository has been used to inform
[architectural diagrams](https://github.com/RubenVerborgh/solid-server-architecture)
for a possible Solid server architecture.
Its code might still be useful for educational purposes.

---

The main goal of this repository
is a strict and modular implementation
of the [Solid HTTP request handling flow](https://github.com/solid/solid-architecture/blob/master/server/request-flow.md).
This flow was designed to ensure that
every decision for every HTTP request
is only made in one place.

This project translates those ideas into working program code.
Crucially, the common logic shared by all HTTP operations in the LDP spec
has been abstracted into
[one single code path](https://github.com/RubenVerborgh/solid-server-ts/blob/master/src/http/ResourceStoreRequestHandler.ts).
In contrast to existing LDP implementations,
which often have individual HTTP methods as an abstraction,
this architecture guarantees common behavior across all HTTP methods,
and makes that behavior [unit-testable](https://github.com/RubenVerborgh/solid-server-ts/blob/master/test/unit/http/ResourceStoreRequestHandler.ts).

A consequence is that the [back-end interface](https://github.com/RubenVerborgh/solid-server-ts/blob/master/src/ldp/ResourceStore.ts)
is not focused on HTTP methods,
but rather on the atomic operations that back-ends need to support.

©2018–present Ruben Verborgh,
[MIT license](https://github.com/RubenVerborgh/solid-server-ts/blob/master/LICENSE.md)
