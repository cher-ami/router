import HomePage from "./pages/HomePage"
import AboutPage from "./pages/AboutPage"
import ContactPage from "./pages/ContactPage"
import NotFoundPage from "./pages/NotFoundPage"
import { TRoute } from "@cher-ami/router"
import ArticlePage from "./pages/ArticlePage"
import FooPage from "./pages/FooPage"
import BarPage from "./pages/BarPage"

export enum EPages {
  HOME = "home",
  ABOUT = "about",
  FOO = "foo",
  BAR = "bar",
  ARTICLE = "article",
  CONTACT = "contact",
  NOT_FOUND = "notfound",
}

export const routes: TRoute[] = [
  {
    path: "/",
    component: HomePage,
    name: EPages.HOME,
    getStaticProps: async (props, currentLang) => {
      const res = await fetch("https://worldtimeapi.org/api/ip")
      const time = await res.json()
      return { time }
    },
  },
  {
    path: { fr: "/a-propos", en: "/about" },
    component: AboutPage,
    name: EPages.ABOUT,
    getStaticProps: async () => {
      const res = await fetch("https://jsonplaceholder.typicode.com/todos/10")
      console.log(
        "================================================================ fetch parent",
      )
      const todo = await res.json()
      console.log("ABOUT todo", todo)
      return { todo: todo }
    },
    children: [
      {
        path: "/foo",
        component: FooPage,
        name: EPages.FOO,
        getStaticProps: async () => {
          console.log(
            "================================================================ fetch children",
          )
          const res = await fetch("https://jsonplaceholder.typicode.com/todos/2")
          const todo = await res.json()
          console.log("foo todo", todo)
          return { todo }
        },
      },
      {
        path: "/bar",
        component: BarPage,
        name: EPages.BAR,
        getStaticProps: async () => {
          console.log(
            "================================================================ fetch children",
          )
          const res = await fetch("https://jsonplaceholder.typicode.com/todos/2")
          const todo = await res.json()
          console.log("bar todo", todo)
          return { todo }
        },
      },
    ],
  },
  {
    path: "/article/:slug",
    component: ArticlePage,
    name: EPages.ARTICLE,
    props: {
      color: "blue",
    },
    getStaticProps: async (props) => {
      const res = await fetch("https://jsonplaceholder.typicode.com/todos")
      const todo = await res.json()
      const mySlug = props.params.slug
      return { todo, mySlug }
    },
  },
  {
    path: "/contact",
    component: ContactPage,
    name: EPages.CONTACT,
    getStaticProps: async () => {
      const data = null

      if (!data) {
        return { notFound: true }
      }
    },
  },
  {
    path: "/:rest",
    component: NotFoundPage,
    name: EPages.NOT_FOUND,
    getStaticProps: async (props) => {
      return { notFound: true }
    },
  },
]
