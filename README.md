<h1 align="center" style="text-align: center">🚃<br>cher-ami router</h1>

<p align="center">
A fresh react router designed for flexible route transitions
<br>
<br>
<img alt="npm" src="https://img.shields.io/npm/v/@cher-ami/router">
<img alt="build" src="https://github.com/cher-ami/router/workflows/CI/badge.svg">
</p>

<br>

cher-ami router API is inspired by [wouter](https://github.com/molefrog/wouter),
[solidify router](https://github.com/solid-js/solidify/blob/master/navigation/Router.ts) and
[vue router](https://router.vuejs.org/) API. This repository started from a copy of [willybrauner/react-router](https://github.com/willybrauner/react-router/).

## Why another react router?

Because manage route transitions with React is always complicated, this router is designed to allow flexible transitions.
It provides Stack component who render previous and current page component when route change.

This router loads [history](https://github.com/ReactTraining/history), [path-parser](https://github.com/troch/path-parser) and [debug](https://github.com/visionmedia/debug) as dependencies.


## Summary

- [Installation](#Installation)
- [Simple usage](#SimpleUsage)
- [Nested routes](#NestedRoutes)
- [Dynamic routes](#DynamicRoutes)

## API

Components:

- [`<Router />`](#Router) Wrap Link and stack component
- [`<Link />`](#Link) Trig current stack
- [`<Stack />`](#Stack) Wrap previous and current page

Hooks:

- [`useRouter`](#useRouter) Get router instance from any component
- [`useLocation`](#useLocation) Get current location and set new location
- [`useRoute`](#useRoute) Get previous and current route
- [`useStack`](#useStack) Register page component in stack
- [`useRouteCounter`](#useRouteCounter) Get route counter + isFirstRoute state
- [`useHistory`](#useHistory) Handle history changed and get global router history

## <a name="Installation"></a>Installation

```shell
$ npm i @cher-ami/router -s
```

## <a name="SimpleUsage"></a>Simple usage

```jsx
import React from "react";
import { Router, Link, Stack } from "@cher-ami/router";

// create a route object
const routesList = [
  {
    path: "/",
    component: HomePage,
  },
  {
    path: "/foo",
    component: FooPage,
  },
];

// wrap render with Router component
// Link and Stack components are available inside a Router
function App() {
  return (
    <Router routes={routesList} base={"/"}>
      <nav>
        <Link href={"/"} />
        <Link href={"/foo"} />
      </nav>
      <Stack />
    </Router>
  );
}
```

Page component need to be wrap by `React.forwardRef`. The `handleRef` lets hold transitions, and ref used by `<Stack />` component.

```jsx
import React from "react";
import { useStack } from "@cher-ami/router";

const FooPage = forwardRef((props, handleRef) => {
  const componentName = "FooPage";
  const rootRef = useRef(null);

  // create custom page transitions (example with GSAP)
  const playIn = () => {
    return new Promise((resolve) => {
      gsap.from(rootRef.current, { autoAlpha: 0, onComplete: resolve });
    });
  };
  const playOut = () => {
    return new Promise((resolve) => {
      gsap.to(rootRef.current, { autoAlpha: 0, onComplete: resolve });
    });
  };

  // register page transition properties used by Stack component
  useStack({ componentName, handleRef, rootRef, playIn, playOut });

  return (
    <div className={componentName} ref={rootRef}>
      {componentName}
    </div>
  );
});
```

**[Demo codesandbox: simple usage](https://codesandbox.io/s/simple-usage-cpufs)**

## <a name="NestedRoutes"></a>Nested Routes

cher-ami router supports nested routes 🙏🏽  

1. define children routes in initial routes list with `children` key;

```js
// create a route object
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
];
```

2. Children where defined in route who render `FooPage` component, so you can now create a new router instance in this component.

**Only if it's a nested router, you must not pass `routes` Router props again**.
The previous routes array, passed to the root component, will be used by `Router`.

`Router` props `base` need to be the same than the path who contains children routes. 
In this case, `/foo` will be the new nested router base. The stack will then able to render `/foo/people` and `/foo/yolo`. 

```jsx
import React from "react";
import { Router, useStack, Stack } from "@cher-ami/router";

const FooPage = forwardRef((props, handleRef) => {
  // ...
  return (
    <div
      className="FooPage"
      // ...
    >
      <Router base={"/foo"}>
        <Stack />
      </Router>
    </div>
  );
});
```

**[Demo codesandbox: nested router](https://codesandbox.io/s/nested-router-bvspe?file=/src/index.tsx)**

## <a name="DynamicRoutes"></a>Dynamic routes

[path-parser](https://github.com/troch/path-parser) accept path parameters. (check this [documentation](https://github.com/troch/path-parser#defining-parameters)).
For example, `/blog/my-article` will matched with this route object:

```js
const routesList = [
  {
    path: "/blog/:id",
    component: ArticlePage,
  },
];
```

You can access route parameters by page component props or by `useRoute()` hook.

```jsx
import React, { useEffect, forwardRef } from "react";
import { useRoute } from "@cher-ami/router";

const ArticlePage = forwardRef((props, handleRef) => {
  useEffect(() => {
    console.log(props.params); // { id: "my-article" }
  }, [props]);

  // or from nested components
  const { currentRoute } = useRoute();
  useEffect(() => {
    console.log(currentRoute.props.params); // { id: "my-article" }
  }, [props]);

  // ...
});
```

**[Demo codesandbox: simple usage](https://codesandbox.io/s/simple-usage-cpufs)**

## Not Found route

It is possible to match a specific route by a simple dynamic route parameter, if all the others do not match.

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
  // this route will be rendered if "/" and "/foo" doesn't match with the current URL
  {
    path: "/:rest",
    component: NotFoundPage,
  },
];
```

In this case, the routes object order declaration is important. `/:rest` path route need to be
the last of the `routesList` array.

**[Demo codesandbox: not found route](https://codesandbox.io/s/not-found-route-eu4bi)**

## Manage transitions

By default, cher-ami router will executed a "sequential" transitions senario: the previous page play out performs, then the new page play in.

```js
const sequencialTransition = ({ previousPage, currentPage, unmountPreviousPage }) => {
  return new Promise(async (resolve) => {
    const $current = currentPage?.$element;

    // hide new page
    if ($current) $current.style.visibility = "hidden";

    // play out and unmount previous page
    if (previousPage) {
      await previousPage.playOut();
      unmountPreviousPage();
    }

    // wait page isReady promise
    await currentPage?.isReadyPromise?.();

    // show and play in new page
    if (currentPage) {
      if ($current) $current.style.visibility = "visible";
      await currentPage?.playIn?.();
    }

    resolve();
  });
};
```

But it's possible to create a custom transitions senario function and pass it to the Stack `manageTransitions` props.
In this example, we would like to create a "crossed" route senario: the previous page playOut performs in same time than the new page playIn.

```jsx
const App = (props, handleRef) => {
  const customSenario = ({ previousPage, currentPage, unmountPreviousPage }) => {
    return new Promise(async (resolve) => {
      // write a custom "crossed" senario...

      if (previousPage) previousPage?.playOut?.();
      if (currentPage) await currentPage?.playIn?.();

      resolve();
    });
  };

  return (
    <Router base={"/foo"}>
      <Stack manageTransitions={customSenario} />
    </Router>
  );
};
```

**[Demo codesandbox: custom manage transitions](https://codesandbox.io/s/inspiring-thompson-tw4qn)**

## <a name="Router"></a>Router

Router component create a new router instance.

```jsx
<Router routes={} base={}>
  {/* can now use <Link /> and <Stack /> component */}
</Router>
```

**Props:**

- **routes** `TRoute[]` Routes list
- **base** `string` Base URL - default: `"/"`

## <a name="Link"></a>Link

Trig new route.

```jsx
<Link to={} className={} />
```

**Props:**

- **to** `string` Path ex: "/foo". Can be absolute `/path/foo` or relative `path/foo`
- **className** `string` _(optional)_ Class name added to component root DOM element

## <a name="Stack"></a>Stack

Render previous and current page component.

```jsx
<Stack manageTransitions={} className={} />
```

**Props:**

- **manageTransitions** `(T:TManageTransitions) => Promise<void>` _(optional)_
  This function allow to create the transition scenario. If no props is filled, a sequential
  transition will be executed.
- **className** `string` _(optional)_ className added to component root DOM element

```ts
type TManageTransitions = {
  previousPage: IRouteStack;
  currentPage: IRouteStack;
  unmountPreviousPage: () => void;
};

interface IRouteStack {
  componentName: string;
  playIn: () => Promise<any>;
  playOut: () => Promise<any>;
  isReady: boolean;
  $element: HTMLElement;
  isReadyPromise: () => Promise<void>;
}
```

## <a name="useRouter"></a>useRouter

Get current router instance.

```jsx
const router = useRouter();
```

## <a name="useLocation"></a>useLocation

Allow the router to change location.

```jsx
const [location, setLocation] = useLocation();
// give URL
setLocation("/bar");
// or an object
setLocation({ name: "FooPage", params: { id: "2" } });
```

**Returns:**

An array with these properties:

- **location** `string` Get current pathname location
- **setLocation** `(path:string | TOpenRouteParams) => void` Open new route

```ts
type TOpenRouteParams = {
  name: string;
  params?: { [x: string]: any };
};
```

## <a name="useRoute"></a>useRoute

Get previous and current route properties (TRoute)

```jsx
const { currentRoute, previousRoute } = useRoute();
```

**Returns:**

An object with these properties:

- **currentRoute** `TRoute` Current route object
- **previousRoute** `TRoute` Previous route object

```ts
type TRoute = {
  path: string;
  component: React.ComponentType<any>;
  props?: { [x: string]: any };
  parser?: Path;
  children?: TRoute[];
  matchUrl?: string;
  fullUrl?: string;
};
```

## <a name="useStack"></a>useStack

Prepare page component for Stack.

```js
useStack({ componentName, handleRef, rootRef, playIn, playOut, isReady });
```

**Parameters:**

- **componentName** `string` Name of current component
- **handleRef** `MutableRefObject<any>` Ref handled by parent component
- **rootRef** `MutableRefObject<any>` Ref on root component element
- **playIn** `() => Promise<any>` _(optional)_ Play in transition - default: `new Promise.resolve()`
- **playOut** `() => Promise<any>` _(optional)_ Play out transition - default: `new Promise.resolve()`
- **isReady** `boolean` _(optional)_ Is ready state - default: `true`

**Returns:**

nothing

## <a name="useRouteCounter"></a>useRouteCounter

Returns route counter

```js
const { routeCounter, isFirstRoute, resetCounter } = useRouteCounter();
```

**Parameters:**

nothing

**Returns:**

An object with these properties:

- **routerCounter** `number` Current route number - default: `1`
- **isFirstRoute** `boolean` Check if is first route - default: `true`
- **resetCounter** `() => void` Reset routerCounter & isFirstRoute states

## <a name="useHistory"></a>useHistory

Allow to get the global router history and execute a callback each time history change.

```js
const history = useHistory((e) => {
  // do something
});
```

**Parameters:**

- **callback** `(event) => void` Callback function to execute each time the history change

**Returns:**

- **history** `location[]` : Location array of history API

---

## Example

Install dependencies

```shell
$ npm i
```

Start dev server

```shell
$ npm run dev
```

## Credits

[Willy Brauner](https://github.com/willybrauner) & [cher-ami](https://cher-ami.tv)
