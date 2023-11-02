<h1 align="center" style="text-align:center">🚃<br>cher-ami router</h1>

<p align="center">
A fresh high-level react router designed for flexible route transitions
<br>
<br>
<img alt="npm" src="https://img.shields.io/npm/v/@cher-ami/router">
<img alt="build" src="https://github.com/cher-ami/router/workflows/CI/badge.svg">
</p>

<br>

## Why another react router?

Because managing route transitions with React is always complicated, this router
is designed to allow flexible transitions. It provides Stack component who
render previous and current page component when route change.

This router loads [history](https://github.com/ReactTraining/history)
, [path-to-regexp](https://github.com/pillarjs/path-to-regexp)
and [@cher-ami/debug](https://github.com/cher-ami/debug) as dependencies.

## Playground

- [example client](https://codesandbox.io/s/github/cher-ami/router/tree/main/examples/example-client)
- [example ssr](https://codesandbox.io/s/github/cher-ami/router/tree/main/examples/example-ssr)

## Summary

- [Installation](#Installation)
- [Simple usage](#Simple-Usage)
- [Dynamic routes](#Dynamic-Routes)
- [Sub Router](#Sub-Router)
- [Manage Transitions](#Manage-Transitions)
  - [Default sequential transitions](#Default-Sequential-Transitions)
  - [Custom transitions](#Custom-Transitions)
- [SSR support](#SSR-Support)
- [Workflow](#Workflow)
- [thanks](#Thanks)
- [credits](#Credits)

**API**

Components:

- [`<Router />`](#Router) Wrap Link and stack component
- [`<Link />`](#Link) Trig current stack
- [`<Stack />`](#Stack) Wrap previous and current page

Hooks:

- [`useRouter`](#useRouter) Get current router informations like currentRoute and previousRoute
- [`useLocation`](#useLocation) Get current location and set new location
- [`useStack`](#useStack) Allow to the parent Stack to handle page transitions and refs
- [`useRouteCounter`](#useRouteCounter) Get global history route counter
- [`useHistory`](#useHistory) Execute callback each time history changes
- [`useLang`](#useLang) get and set langService current language object
  changes

Services:

- [`LangService`](#LangService) Manage `:lang` params
- [`Translate Path`](#TranslatePath)

Global:

- [`Helpers`](#Helpers) Global Routers helpers
- [`Routers object`](#Routers) Global Routers object contains all routers properties (history, instances...)

## Installation

```shell
$ npm i @cher-ami/router -s
```

## Simple usage

```jsx
import React from "react"
import { Router, Link, Stack } from "@cher-ami/router"
import { createBrowserHistory } from "history"

const routesList = [
  {
    path: "/",
    component: HomePage,
  },
  {
    path: "/foo",
    component: FooPage,
  },
]

const history = createBrowserHistory()

function App() {
  return (
    <Router routes={routesList} history={history} base={"/"}>
      <nav>
        <Link to={"/"} />
        <Link to={"/foo"} />
      </nav>
      <Stack />
    </Router>
  )
}
```

Page component need to be wrapped by `React.forwardRef`. The `handleRef` lets
hold transitions, and ref used by `<Stack />` component.

```jsx
import React from "react"
import { useStack } from "@cher-ami/router"

const FooPage = forwardRef((props, handleRef) => {
  const componentName = "FooPage"
  const rootRef = useRef(null)

  // create custom page transitions (example-client with GSAP)
  const playIn = () => {
    return new Promise((resolve) => {
      gsap.from(rootRef.current, { autoAlpha: 0, onComplete: resolve })
    })
  }
  const playOut = () => {
    return new Promise((resolve) => {
      gsap.to(rootRef.current, { autoAlpha: 0, onComplete: resolve })
    })
  }

  // register page transition properties used by Stack component
  useStack({ componentName, handleRef, rootRef, playIn, playOut })

  return (
    <div className={componentName} ref={rootRef}>
      {componentName}
    </div>
  )
})
```

## Dynamic routes

cher-ami router use [path-to-regexp](https://github.com/pillarjs/path-to-regexp) which
accept path parameters. (check
this [documentation](https://github.com/pillarjs/path-to-regexp)).
For example, URL `/blog/my-article` will match with this route object:

```js
const routesList = [
  {
    path: "/blog/:id",
    component: ArticlePage,
  },
]
```

You can access route parameters by page component props or by `useRouter()` hook.

```jsx
import React, { useEffect, forwardRef } from "react"
import { useRoute } from "@cher-ami/router"

const ArticlePage = forwardRef((props, handleRef) => {
  useEffect(() => {
    console.log(props.params) // { id: "my-article" }
  }, [props])

  // or from any nested components
  const { currentRoute } = useRouter()
  useEffect(() => {
    console.log(currentRoute.props.params) // { id: "my-article" }
  }, [currentRoute])

  // ...
})
```

Also, it is possible to match a specific route by a simple dynamic route
parameter for the "not found route" case. In this case, the routes object order
declaration is important. `/:rest` path route need to be the last of
the `routesList` array.

```js
const routesList = [
  {
    path: "/",
    component: HomePage,
  },
  {
    path: "/foo",
    component: FooPage,
  },
  // if "/" and "/foo" doesn't match with the current URL, this route will be rendered
  {
    path: "/:rest",
    component: NotFoundPage,
  },
]
```

## Sub-router

cher-ami router supports nested routes from sub routers instance 🙏🏽.
It is possible to nest as many routers as you want.

1. Define children routes in initial routes list with `children` property;

```js
const routesList = [
  {
    path: "/",
    component: HomePage,
  },
  {
    path: "/foo",
    component: FooPage,

    // define children routes here
    children: [
      {
        path: "/people",
        component: PeoplePage,
      },
      {
        path: "/yolo",
        component: YoloPage,
      },
    ],
  },
]
```

2. Children were defined within the route that render `FooPage` component, so
   you can then create a new router instance in this component.

3. The new subRouter needs his own base and routes list, `getSubRouterBase` and `getSubRouterRoutes` functions are available to get them.

```jsx
import React from "react"
import {
  Router,
  useStack,
  Stack,
  useRouter,
  getPathByRouteName,
  getSubRouterBase,
  getSubRouterRoutes,
} from "@cher-ami/router"

const FooPage = forwardRef((props, handleRef) => {
  const router = useRouter()
  // Parsed routes list and get path by route name -> "/foo"
  const path = getPathByRouteName(router.routes, "FooPage")
  // (if last param is false, '/:lang' will be not added) -> "/base/:lang/foo"
  const subBase = getSubRouterBase(path, router.base, true)
  // get subRoutes
  const subRoutes = getSubRouterRoutes(path, router.routes)
  return (
    <div>
      <Router base={subBase} routes={subRoutes}>
        <Stack />
      </Router>
    </div>
  )
})
```

## Manage transitions

`ManageTransitions` function allows to define, "when" and "in what conditions",
routes transitions will be exectued.

### Default sequential transitions

By default, a "sequential" transitions senario is used by Stack component: the
previous page play out performs, then the new page play in.

```js
const sequencialTransition = ({ previousPage, currentPage, unmountPreviousPage }) => {
  return new Promise(async (resolve) => {
    const $current = currentPage?.$element

    // hide new page
    if ($current) $current.style.visibility = "hidden"

    // play out and unmount previous page
    if (previousPage) {
      await previousPage.playOut()
      unmountPreviousPage()
    }

    // wait page isReady promise
    await currentPage?.isReadyPromise?.()

    // show and play in new page
    if (currentPage) {
      if ($current) $current.style.visibility = "visible"
      await currentPage?.playIn()
    }

    resolve()
  })
}
```

### Custom transitions

It's however possible to create a custom transitions senario function and pass
it to the Stack `manageTransitions` props. In this example, we would like to
create a "crossed" route senario: the previous page playOut performs at the same
time than the new page playIn.

```jsx
const App = (props, handleRef) => {
  const customSenario = ({ previousPage, currentPage, unmountPreviousPage }) => {
    return new Promise(async (resolve) => {
      // write a custom "crossed" senario...
      if (previousPage) previousPage?.playOut()
      if (currentPage) await currentPage?.playIn()

      resolve()
    })
  }

  return (
    // ...
    <Stack manageTransitions={customSenario} />
  )
}
```

## SSR Support

This router is compatible with SSR due to using `staticLocation` props instead of `history` props on Router instance.
In this case, the router will match only with `staticLocation` props value and render the appropiate route without invoking the browser history. (Because `window` is not available on the server).

```jsx
<Router
  routes={routesList}
  staticLocation={"/foo"}
  // history={createBrowserHistory()}
>
  // ...
</Router>
```

In order to use this router on server side, we need to be able to request API on the server side too.
In this case, request will be print as javascript window object on the renderToString html server response.
The client will got this response.

To be able to request on server side (and on client side too), `getStaticProps` route property is available:

```ts
   {
    path: "/article/:slug",
    component: ArticlePage,
    name: "Article",
    getStaticProps: async (props, currentLang) => {
      // props contains route props and params (ex: slug: "article-1")
      const res = await fetch(`https://api.com/posts/${currentLang.key}/${props.params.slug}`);
      const api = await res.json();
      return { api };
    }
  }
```

Then, get the response data populated in page component props:

```tsx
function HomePage({ api }) {
  return <div>{api.title}</div>
}
```

For larger example, check the [example-ssr folder](./examples/example-ssr/).

## Workflow

```shell
# Install dependencies
pnpm i

## build watch
pnpm run build:watch

## start tests
pnpm run test:watch

## start all examples
pnpm run dev

## Before publishing
pnpm run pre-publish

## Increment version
npm version {patch|minor|major}

## Publish
npm publish
```

## API

### Router

Router component creates a new router instance.

```jsx
<Router routes={} base={} history={} staticLocation={} middlewares={} id={}>
  {/* can now use <Link /> and <Stack /> component */}
</Router>
```

**Props:**

- **routes** `TRoute[]` Routes list
- **base** `string` Base URL - default: `"/"`
- **history** `BrowserHistory | HashHistory | MemoryHistory` _(optional)_ create and set an history - default : `BrowserHistory`
  History mode can
  be [BROWSER](https://github.com/ReactTraining/history/blob/master/docs/api-reference.md#createbrowserhistory)
  ,
  [HASH](https://github.com/ReactTraining/history/blob/master/docs/api-reference.md#createhashhistory)
  ,
  [MEMORY](https://github.com/ReactTraining/history/blob/master/docs/api-reference.md#creatememoryhistory)
  . For more information, check
  the [history library documentation](https://github.com/ReactTraining/history/blob/master/docs/api-reference.md)
- **staticLocation** `string` _(optional)_ use static URL location matching instead of history
- **middlewares** `[]` _(optional)_ add routes middleware function to patch each routes)
- **id** `?number | string` _(optional)_ id of the router instance - default : `1`

### Link

Trig new route.

```jsx
<Link to={} className={} />
```

**Props:**

- **to** `string | TOpenRouteParams` Path ex: `/foo` or `{name: "FooPage" params: { id: bar }}`.
  "to" props accepts same params than setLocation.
- **children** `ReactNode` children link DOM element
- **onClick** `()=> void` _(optional)_ execute callback on the click event
- **className** `string` _(optional)_ Class name added to component root DOM element

### Stack

Render previous and current page component.

```jsx
<Stack manageTransitions={} className={} />
```

**Props:**

- **manageTransitions** `(T:TManageTransitions) => Promise<void>` _(optional)_
  This function allows to create the transition scenario. If no props is filled,
  a sequential transition will be executed.
- **className** `string` _(optional)_ className added to component root DOM
  element

```ts
type TManageTransitions = {
  previousPage: IRouteStack
  currentPage: IRouteStack
  unmountPreviousPage: () => void
}

interface IRouteStack {
  componentName: string
  playIn: () => Promise<any>
  playOut: () => Promise<any>
  isReady: boolean
  $element: HTMLElement
  isReadyPromise: () => Promise<void>
}
```

### useRouter

Get current router informations:

```jsx
const router = useRouter()
```

**Returns:**

`useRouter()` returns an object with these public properties:

- **currentRoute** `TRoute` Current route object
- **previousRoute** `TRoute` Previous route object
- **routeIndex** `number` Current router index
- **base** `string` Formated base URL
- **setPaused** `(paused:boolean) => void` Paused router instance
- **getPaused** `() => void` Get paused state of router instance

```ts
// previousRoute and currentRoute
type TRoute = Partial<{
  path: string | { [x: string]: string }
  component: React.ComponentType<any>
  base: string
  name: string
  parser: Match
  props: TRouteProps
  children: TRoute[]
  url: string
  params?: TParams
  queryParams?: TQueryParams
  hash?: string
  getStaticProps: (props: TRouteProps, currentLang: TLanguage) => Promise<any>
  _fullUrl: string // full URL who not depends on current instance
  _fullPath: string // full Path /base/:lang/foo/second-foo
  _langPath: { [x: string]: string } | null
  _context: TRoute
}>
```

### useLocation

Allow the router to change location.

```jsx
const [location, setLocation] = useLocation()
// give URL
setLocation("/bar")
// or an object
setLocation({ name: "FooPage", params: { id: "2" } })
```

**Returns:**

An array with these properties:

- **location** `string` Get current pathname location
- **setLocation** `(path:string | TOpenRouteParams) => void` Open new route

```ts
type TOpenRouteParams = {
  name: string
  params?: TParams
  queryParams?: TQueryParams
  hash?: string
}
```

### useStack

useStack allows to the parent Stack to handle page transitions and refs.

**usage:**

```jsx
import React from "react";
import { useStack } from "@cher-ami/router";

const FooPage = forwardRef((props, handleRef) => {
  const componentName = "FooPage";
  const rootRef = useRef(null);

  const playIn = () => new Promise((resolve) => {  ... });
  const playOut = () => new Promise((resolve) => {  ... });

  // "handleRef" will get properties via useImperativeHandle
  useStack({
    componentName,
    handleRef,
    rootRef,
    playIn,
    playOut
  });

  return (
    <div className={componentName} ref={rootRef}>
      {/* ... */}
    </div>
  );
});
```

`useStack` hook can also receive `isReady` state from the page component. This
state allows for example to wait for fetching data before page playIn function
is executed.

```jsx
// ...

const [pageIsReady, setPageIsReady] = useState(false)

useEffect(() => {
  // simulate data fetching or whatever for 2 seconds
  setTimeout(() => {
    setPageIsReady(true)
  }, 2000)
}, [])

useStack({
  componentName,
  handleRef,
  rootRef,
  playIn,
  playOut,
  // add the state to useStack
  // playIn function wait for isReady to change to true
  isReady: pageIsReady,
})

// ...
```

How does it work? `useStack` hook registers `isReady` state and `isReadyPromise`
in `handleRef`.
`manageTransitions` can now use `isReadyPromise` in its own thread senario.

```js
const customManageTransitions = ({ previousPage, currentPage, unmountPreviousPage }) => {
  return new Promise(async (resolve) => {
    // ...
    // waiting for page "isReady" state to change to continue...
    await currentPage?.isReadyPromise?.()
    // ...
    resolve()
  })
}
```

**[Demo codesandbox: wait-is-ready](https://codesandbox.io/s/wait-isready-6irps?file=/src/pages/AboutPage.tsx)**

**Parameters:**

- **componentName** `string` Name of current component
- **handleRef** `MutableRefObject<any>` Ref handled by parent component
- **rootRef** `MutableRefObject<any>` Ref on root component element
- **playIn** `() => Promise<any>` _(optional)_ Play in transition -
  default: `new Promise.resolve()`
- **playOut** `() => Promise<any>` _(optional)_ Play out transition -
  default: `new Promise.resolve()`
- **isReady** `boolean` _(optional)_ Is ready state - default: `true`

**Returns:**

nothing

### useRouteCounter

Returns route counter

```js
const { routeCounter, isFirstRoute, resetCounter } = useRouteCounter()
```

**Parameters:**

nothing

**Returns:**

An object with these properties:

- **routerCounter** `number` Current route number - default: `1`
- **isFirstRoute** `boolean` Check if it's first route - default: `true`
- **resetCounter** `() => void` Reset routerCounter & isFirstRoute states

### useHistory

Allow to get the global router history and execute a callback each time history
change.

```js
const history = useHistory((e) => {
  // do something
})
```

**Parameters:**

- **callback** `(event) => void` Callback function to execute each time the
  history change

**Returns:**

- **history** `History` : global history object. (`Routers.history`)

### useLang

Get and update langService current language object.

```tsx
const [lang, setLang] = useLang()
useEffect(() => {
  // when current lang change
  // it's usefull only if setLang method do not refresh the page.
}, [lang])

// set new lang with lang object "key" property value only
setLang("en")
// set new lang with the lang object
setLang({ key: "en" })
```

**Returns:**

Array of :

- **lang** `TLanguage` : current lang object
- **setLang** `(lang: TLanguage | string, force: boolean) => void` : set new lang object (same API than `langService.setLang`)

### LangService

Manage `:lang` params from anywhere inside Router scope.

```jsx
import { LangService } from "@cher-ami/router"
import { Stack } from "./Stack"

const base = "/"

// first lang object is default lang
const languages = [{ key: "en" }, { key: "fr" }, { key: "de" }]
// optionally, default lang can be defined explicitly
// const languages = [{ key: "en" }, { key: "fr", default: true }, { key: "de" }];

// Create LangService instance
const langService = new LangService({
  languages,
  showDefaultLangInUrl: true,
  base,
})

;<Router langService={langService} routes={routesList} base={base}>
  <App />
</Router>
```

Inside the App

```jsx
function App() {
  // get langService instance from router context
  const { langService } = useRouter()

  return (
    <div>
      <button onClick={() => langService.setLang({ key: "de" })}>
        switch to "de" lang
      </button>
      <nav>
        {/* will return /de */}
        <Link to={"/"} />
        {/* will return /de/foo */}
        <Link to={"/foo"} />
      </nav>
      <Stack />
    </div>
  )
}
```

**Methods:**

#### constructor({ languages: TLanguage<TLang>[]; showDefaultLangInUrl?: boolean; base?: string; }) `void`

Initialize LangService by passing it to "langService" Router props

constructor object properties:

- `languages`: list on language objects
- `showDefaultLangInUrl`: choose if default language is visible in URL or not
- `base`: set the same than router base

```jsx
const langService = new LangService({
  languages: [{ key: "en" }, { key: "fr" }],
  showDefaultLangInUrl: true,
  base: "/",
})
```

`langService` instance is available in Router scope from `useRouter()` hook.

```tsx
const Page = () => {
  const { langService } = useRouter()
  // langService.setLang() ...
}
```

#### languages `Tlanguage[]`

Return languages list

```jsx
const langages = langService.languages
```

#### currentLang `TLanguage`

Return current Language object.

```jsx
const lang = langService.currentLang
// { key: "..." }
```

#### defaultLang `TLanguage`

Return default language object

```jsx
const defaultLang = langService.defaultLang
// { key: "..." }
```

#### isInit `boolean`

Return langService init state

```jsx
const isInit = langService.isInit
```

#### setLang(toLang: TLanguage, forcePageReload = true) `void`

Switch to another available language. This method can be called in nested router
component only.

- `forcePageReload`: choose if we reload the full application or using the
  internal router stack to change the language

```jsx
langService.setLang({ key: "de" })
```

#### redirectToDefaultLang(forcePageReload = true) `void`

If URL is `/`, `showDefaultLangInUrl` is set to `true` and default lang is 'en',
it will redirect to `/en`.

- `forcePageReload`: choose if we reload the full application or using the
  internal router stack to change the language

```js
langService.redirectToDefaultLang()
```

#### redirectToBrowserLang(forcePageReload = true) `void`

Same than `redirectToDefaultLang` method but redirect to the user `navigator.language`.
If the browser language doesn't exist in Languages array, we redirect to the default lang.

```js
langService.redirectToBrowserLang()
```

### Translate Path

Paths can be translated by lang in route path property. This option works only if LangService instance is created and passed to the Router component.

```js
  {
    path: { en: "/foo", fr: "/foo-fr", de: "/foo-de" },
    component: FooPage,
  }
```

## Helpers

#### createUrl()

`(args: string | TOpenRouteParams, base?:string, allRoutes?: TRoute[]) => string`

Create a formated URL by string, or `TOpenRouteParams`

#### openRoute()

`(args: string | TOpenRouteParams, history?) => void`

Push new route in current history. Stack(s) component(s) will return the appriopriate route.

## Routers

Routers is a global object who contains all routers informations. Because @cher-ami/router is possibly multi-stack, we need a global object to store shared informations between router instances.

#### Routers.routes

`TRoute[]`

Final routes array used by the router be

#### Routers.history

`HashHistory | MemoryHistory | BrowserHistory`

Selected history mode. all history API is avaible from this one.

#### Routers.langService

`LangService`

LangService instance given to the first Router component.

#### Routers.routeCounter

`number`

How many route are resolved from the start of the session. This property is also available from `useRouteCounter`.

#### Routers.isFirstRoute

`boolean`

Is it the first route of the session. This property is also available from `useRouteCounter`.

## Thanks

cher-ami router API is inspired by [wouter](https://github.com/molefrog/wouter),
[solidify router](https://github.com/solid-js/solidify/blob/master/navigation/Router.ts)
and
[vue router](https://router.vuejs.org/) API.

## Credits

[Willy Brauner](https://github.com/willybrauner)
& [cher-ami](https://cher-ami.tv)
