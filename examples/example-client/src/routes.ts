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
    children: [
      {
        path: "/la",
        component: LaPage,
      },
      {
        path: "/our",
        component: OurPage,
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
