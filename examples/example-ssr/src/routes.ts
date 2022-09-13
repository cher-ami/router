import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import NotFoundPage from "./pages/NotFoundPage"
import { TRoute } from "@cher-ami/router";
import ArticlePage from "./pages/ArticlePage"

export const routes: TRoute[] = [
  {
    path: "/",
    component: HomePage,
    name: "Home",
    getStaticProps: async (props) => {
      const res = await fetch("https://worldtimeapi.org/api/ip");
      const time = await res.json();
      return { time };
    },
  },
  {
    path: "/about",
    component: AboutPage,
    name: "About",
    getStaticProps: async () => {
      const res = await fetch("https://jsonplaceholder.typicode.com/todos");
      const todo = await res.json();
      return { todo };
    },
  },
  {
    path: "/article/:slug",
    component: ArticlePage,
    name: "Article",
    props: {
      color: "blue",
    },
    getStaticProps: async (props) => {
      const res = await fetch("https://jsonplaceholder.typicode.com/todos");
      const todo = await res.json();

      const mySlug = props.params.slug

      return { todo, mySlug };
    },
  },
  {
    path: "/contact",
    component: ContactPage,
    name: "Contact",
  },
  {
    path: "/:rest",
    component: NotFoundPage,
    name: "Notfound",
  },
];
