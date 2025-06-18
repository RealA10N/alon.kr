---
layout: post
title: "Comptime Done Right"
description: "Approximating the Metric TSP Problem: An Introduction to Combinatorial Optimization."
published: 2025-04-27
tags: []
---

<script>
//   import Highlight, { LineNumbers } from "svelte-highlight";
//   import c from "svelte-highlight/languages/c";
//   import "svelte-highlight/styles/edge-dark.css";

  const code = "struct Person {
    char name[50];
    int age;
    float height;
    char address[100];
};";
</script>

<!-- <Highlight language={c} {code} let:highlighted>
  <LineNumbers {highlighted} hideBorder />
</Highlight> -->

```c title="SADA"
struct Person {
    char name[50];
    int age;
    float height;
    char address[100];
};
```

Compile time evaluation (*comptime*) is one of the most powerful tools of modern languages. It allows you, as the developer, to execute code in compilation time, and store only the result of the computation in the executable binary, spearing both runtime execution time and usually also reducing the binary size, since some code can be now emitted from it.

## Antique Languages

Older programming languages and compilers do not support comptime at all. C developers fill this void by extensive use of macros. They can be quite powerful, but require special syntax, not type safe, and can't execute code at compilation type, just manipulate tokens, and in the best case scenario rely on the compiler to evaluate expressions in compilation time and/or optimize them.


<!-- macro def in the kernel -->

*yacc* and *bison* are popular parser generators, which are used as standalone executables that receive a configuration files as input (the specification of a language grammar), and output C code that mainly contains hardcoded data structures and state machines that are then efficiently used to parse the provided language.

<!-- example of yacc output -->

The generated code is clearly not meant to be read by humans. Moreover, if modified it may easily become unsafe, especially if one tinkers with the generated state machine binary arrays.

Plus, if you have tried using those tools yourself you will probably vogue the developer experience is not great: the compilation pipeline complicates, and for your code to interact with yacc and, for example, generate meaningful parsing errors, you need to inject and hook you code into the generated parser code. Doing it right requires a fairly deep understanding of the parser generator, which is at that point more of a fully fledged code generation framework instead of just a C library. I'm not saying it is bad, I'm just suggesting there are better ways in modern environments.
