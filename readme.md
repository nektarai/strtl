# 😮 Strtl [![NPM](https://img.shields.io/npm/v/strtl?style=flat-square)](https://www.npmjs.com/package/strtl)

A shockingly minimal templating language for strings and JSON.

The syntax is as small and intuitive as possible, while retaining powerful features like custom helpers. There are zero dependencies, and the renderer (used on the client), is under 200 lines of code.

- **[Syntax and rendering](#syntax-and-rendering)**
  - [Scope](#scope)
  - [Helpers](#helpers)
  - [Default](#default)
  - [Loops](#loops)
  - [Conditionals](#conditionals)
  - [Escaping](#escaping)
  - [Truthiness](#truthiness)

- **[Building JSON templates](#building-json-templates)**
  - [Concept](#concept)
  - [Simpe example](#simple-example)
  - [Helpers](#helpers-1)
  - [Loops](#loops-1)
  - [Conditionals](#conditionals-1)
  - [Default](#default-1)
  - [Combining helpers](#combining-helpers)

- **[Why JSON templates?](#why-json-templates)**

## Syntax and rendering

```js
import render from 'strtl/render';
```

There are two render methods:
- `render.toString()`: Renders a template to a string and returns it.
- `render.toObject()`: Does the same thing but does `JSON.parse()` on the result before returning it.

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

The first argument to the helper function will be the value before the `:`. This will be of the same type as in the scope: in the example above, this will be a number. The remaining arguments are from the template, and passed as strings ('2' above).

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

Helper functions may return any JavaScript value, but the value returned by the last helper in a chain is converted to a string before inserting into the template.

Finally, you could also have helper-only tags:

```js
render.toString(
  'Die roll: {:roll}',
  {},
  { roll: () => 1 + Math.floor(6 * Math.random()) }
)

// Returns 'Die roll: 4'
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

When looping over strings or numbers, `{=}` is the placeholder for the current element. Loops also support helpers, which are called with an array of rendered strings as the first argument.

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

### Escaping

There are no reserved characters that need to be escaped. However the following 2-character tokens, if they appear in the text, need to be escaped:

- Start of an embedded tag: `{=`, `{#`, `{?`, `{!`, `{:` `{|`
- End of a nested template: `|:`, `|}`

Escaping is performed by inserting a space character between the two characters of the token. If a string is escaped twice, it will have two spaces, and so on. Each call to render un-escapes once by removing a single space.

### Truthiness

If a placeholder is considdered falsy if it does not exist in the scope or resolves to `undefined`, `null`, `false`, `0`, an empty string or an empty array. In all other cases, it's considered truthy.

## Building JSON templates

```js
import build from 'strtl/build';
```

`build()` is a somewhat magical function to intuitively build templates that can `render.toObject()` into JS objects. There is no equivalent function for building string templates, as those are easy to write by hand.

### Concept

`build()` accepts a JavaScript function as argument, and returns a template string representing the data transformation operations in that function. You can pretend that the function can time travel into the future when the template is rendered, and the render time data is passed to it as an argument.

That might sound like we're calling `.toString()` on the function and sending it to the client to be `eval`uated - we are not. We use ES Proxies to make this syntax work.

### Simple example

```js
build(({ name }) => ({ N: name }))

// Returns '{"N":{=name:json}}'
```

Note the `:json` helper. `toObject()` adds this helper transparently; this allows `name` to be any valid JSON object, not just a string.

This template can be used with `.toObject()`:

```js
render.toObject('{"N":{=name:json}}', { name: 'Alice' })
// Returns { N: 'Alice' }

render.toObject('{"N":{=name:json}}', { name: ['First', 'Last'] })
// Returns { N: ['First', 'Last'] }
```

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

## Why JSON templates

While there are undoubtedly other use cases for a templating language for JSON objects, this is ours:

We have a mobile app that can display custom, user-configured forms, described using JSON. We require client-side interactivity where some fields should be reconfigured (enabled or disabled, shown or hidden, options modified) when the value in another field changes.

Users can now build JSON templates for their forms to express these requirements.
