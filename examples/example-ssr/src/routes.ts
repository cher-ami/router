import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import NotFoundPage from "./pages/NotFoundPage";
import { TRoute } from "@cher-ami/router";
import ArticlePage from "./pages/ArticlePage";
import FooPage from "./pages/FooPage";
import BarPage from "./pages/BarPage";

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
    getStaticProps: async (props) => {
      const res = await fetch("https://worldtimeapi.org/api/ip");
      const time = await res.json();
      return { time };
    },
  },
  {
    path: { fr: "/a-propos", en: "/about" },
    component: AboutPage,
    name: EPages.ABOUT,
    getStaticProps: async () => {
      const res = await fetch("https://jsonplaceholder.typicode.com/todos");
      const todo = await res.json();
      return { todo };
    },
    children: [
      {
        path: "/foo",
        component: FooPage,
        name: EPages.FOO,
      },
      {
        path: "/bar",
        component: BarPage,
        name: EPages.BAR,
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
      const res = await fetch("https://jsonplaceholder.typicode.com/todos");
      const todo = await res.json();
      const mySlug = props.params.slug;
      return { todo, mySlug };
    },
  },
  {
    path: "/contact",
    component: ContactPage,
    name: EPages.CONTACT,
  },
  {
    path: "/:rest",
    component: NotFoundPage,
    name: EPages.NOT_FOUND,
  },
];
