# 😮 Strtl

A shockingly minimal templating language for strings and JSON. This package publishes tiny functions for [rendering](#rendering-templates) and [building](#building-templates) templates.

## Rendering templates

```js
import render from 'strtl/render';
```

There are two render methods:
- `render.toString()`: Renders a template to a string.
- `render.toObject()`: Does the same thing and then calls `JSON.parse()` with the result. It literally does nothing else, so the rest of this section covers `toString()`.

```js
render.toString(
  'Hello, {=name}!',
  { name: 'World' }
);

// Returns 'Hello, World!'
```

### Scope

A template string is processed in the context of a *scope* to return a rendered string. Placeholders in the template may be dot-separated expressions that are resolved in the scope.

The scope might be a single object or a list of objects. If it's a list, strtl uses the first one in which a placeholder appears.

```js
render.toString(
  'Hi {=user.name}, you have {=user.count} notifications.',
  [
    { user: { name: 'Emily' } },
    { user: { count: 3 } }
  ]
)

// Returns 'Hi Emily, you have 3 notifications.'
```

### Helpers

Helpers are transformation functions that can be applied to values before printing. Helper names are prefixed with `:` and accept arguments separated by spaces.

```js
render.toString(
  'Total: {=total:toFixed 2}',
  { total: 3.1416 },
  { toFixed: (num, digits) => num.toFixed(digits) }
)

// Returns 'Total: 3.14'
```

It's also possible to chain multiple helpers, and to pass a rendered template through helpers:

```js
render.toString(
  '{|Hello {=name}|:toUpperCase :urlEncode}',
  { name: 'World' }
  {
    toUpperCase: str => str.toUpperCase(),
    urlEncode: str => encodeURIComponent(str)
  }
)

// Returns 'HELLO%20WORLD'
```

### Default

A default value may be provided, which is used when the placeholder's value is [falsy](#truthiness):

```js
render.toString(
  'Hi {=name|You|}',
  {}
)

// Returns 'Hi You'
```

This works as expected with helpers too.

```js
'{=placeholder:helper|Default value|:defaultHelper}'
```

### Loops

Loops use the syntax `{#variable|Repeating template|}`, where `variable` points to an array in the scope. For each value in that array, the template between the `|` and `|}` is rendered, and the item itself is added to the scope.

```js
render.toString(
  '{#books| ${title} by ${author}; |}',
  { books: [
    { title: '1984', 'George Orwell' },
    { title: '2001', 'Arthur C Clarke' }
  ] }
)

// Returns '1984 by George Orwell; 2001 by Arthur C Clarke;'
```

When looping over strings or numbers, `{=}` is the placeholder for the current element. Loops also support helpers, which are called with an array of rendered strings.

```js
render.toString(
  'Hi {#names|Dr. {=}|:listFormat}',
  { names: ['Alice', 'Bob', 'Carol'] },
  { listFormat: items => new Intl.ListFormat('en').format(items) }
)

// Returns 'Hi Dr. Alice, Dr. Bob and Dr. Carol'
```

### Conditionals

The tag `{?variable|True template|}` renders the sub-template if the variable is [truthy](#truthiness), while `{!variable|False template|}` renders it if it is falsy.

There is also a couple of shortcuts for common patterns:

- `{?variable|True template|:|False template|}`. If-else without repeating the variable. This is syntactic sugar for `{?variable|True template|}{!variable|False template|}`.
- `{#variable|Repeating Template|:|Empty template|}`. A default value for empty loops. Syntactic sugar for `{#variable|Repeating Template|}{!variable|Empty template|}`.

### Truthiness

If a placeholder is considdered falsy if it does not exist in the scope or resolves to `undefined`, `null`, `false`, `0`, an empty string or an empty array. In all other cases, it's considered truthy.

## Building templates

```js
import build from 'strtl/build';
```

`build()` is a somewhat magical function to intuitively build templates that can `render.toObject()` into JS objects. There is no equivalent for building string templates - those are easy to write by hand.

### Concept

`build()` lets you write a function that does what you want `render.toObject` to do. You can pretend that your function gets packaged up into the template, and gets unpacked and executed with render-time data.

That might sound like we're using `eval()` or `new Function()` - we are not. We use ES Proxies to make this syntax work.

### Simple example

```js
build(({ name }) => ({ N: name }))

// Returns '{"N":{=name:json}}'
```

Note the `:json` helper. `toObject()` adds this helper transparently; this allows `name` to be any valid JSON object, not just a string.

### Helpers

Method calls become helpers.

```js
build(({ name }) => ({ N: name.upper() }))

// Returns '{"N":{=name:upper:json}}'
```

### Loops

Not **all** method calls become helpers; `.map()` is a special method to produce loops. They work like `Array.prototype.map()`.

```js
build(({ emails }) => ({
  E: emails.map(e => e),
}))

// Returns '{"E":[{#emails|{=:json},|}]}'
```

### Conditionals

The if-else construct is supported, but unfortunately this requires using the special `.then()` and `.else()` methods in a chain rather than `if` statements or ternary operators.

```js
build(({ error }) => ({
  code: error.then(400).else(200)
}))

// Returns '{"code":{?error|400|:|200|}}'
```

Note that it is possible to write a `.then()` call without an `.else()`, but the opposite is not.

### Default

`.else()` does double-duty as the method for providing a default value for a placeholder.

```js
build(({ name }) => ({
  N: name.else('Hi')
}))

// Returns '{"N":{=name:json|"Hi"|}}'
```

### Combining helpers

Helpers can be combined with loops, conditionals and default.

```js
build(({ emails }) => ({
  E: emails.map(e => e.upper()).filter('example.com'),
}))

// Returns '{"E":[{#emails|{=:upper:json},|:filter example.com}]}'
```

```js
build(({ error }) => ({
  code: error.then(400).toFixed().else(200).toFixed()
}))

// Returns '{"code":{?error|400|:toFixed|200|:toFixed}}'
```

```js
build(({ name, number }) => ({
  N: name.else({ foo: number })
}))

// Returns '{"N":{=name:json|{"foo":{=number:json}}|}}'
```
