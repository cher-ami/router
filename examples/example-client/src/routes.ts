import { TRoute } from "@cher-ami/router"

import HomePage from "./pages/HomePage"
import AboutPage from "./pages/AboutPage"
import ArticlePage from "./pages/ArticlePage"
import FooPage from "./pages/FooPage"
import BarPage from "./pages/BarPage"
import NotFoundPage from "./pages/NotFoundPage"
import YoloPage from "./pages/YoloPage"
import HelloPage from "./pages/HelloPage"
import LaPage from "./pages/LaPage"
import OurPage from "./pages/OurPage"

/**
 * Define routes list
 */
export const routesList: TRoute[] = [
  {
    path: "/",
    component: HomePage,
    children: [
      {
        path: { en: "/foo", fr: "/foo-fr", de: "/foo-de" },
        component: FooPage,
      },
      {
        path: "/bar",
        component: BarPage,
        children: [
          {
            path: "/yolo",
            component: YoloPage,
            getStaticProps: async (props, currentLang) => {
              const res = await fetch("https://worldtimeapi.org/api/ip")
              const time = await res.json()
              return { time }
            },
          },
          {
            path: "/hello",
            component: HelloPage,
          },
        ],
      },
    ],
  },
  {
    // path: "/about",
    path: { en: "/about", fr: "/a-propos", de: "/uber" },
    component: AboutPage,
    getStaticProps: async (props, currentLang) => {
      console.log(
        "================================================================ fetch parent",
      )
      const res = await fetch("https://jsonplaceholder.typicode.com/todos/1")
      const todo = await res.json()
      return { todo }
    },
    children: [
      {
        path: "/la",
        component: LaPage,
        getStaticProps: async (props, currentLang) => {
          console.log(
            "================================================================ fetch children 1",
          )
          const res = await fetch("https://jsonplaceholder.typicode.com/todos/2")
          const todo = await res.json()
          return { todo }
        },
      },
      {
        path: "/our",
        component: OurPage,
        getStaticProps: async (props, currentLang) => {
          console.log(
            "================================================================ fetch children 2",
          )
          const res = await fetch("https://jsonplaceholder.typicode.com/todos/3")
          const todo = await res.json()
          return { todo }
        },
      },
    ],
  },
  {
    // path: "/blog/:id",
    path: { en: "/blog/:id", fr: "/blog-fr/:id", de: "/blog-de/:id" },
    component: ArticlePage,
    props: {
      color: "red",
    },
    getStaticProps: async (props, currentLang) => {
      const res = await fetch("https://worldtimeapi.org/api/ip")
      const time = await res.json()
      return { time }
    },
  },
  {
    path: "/:rest",
    component: NotFoundPage,
  },
]
