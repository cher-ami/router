import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import ArticlePage from "./pages/ArticlePage";
import FooPage from "./pages/FooPage";
import BarPage from "./pages/BarPage";
import { TRoute } from "../src/components/Router";
import NotFoundPage from "./pages/NotFoundPage";

/**
 * Define routes list
 */
export const routesList: TRoute[] = [
  {
    path: "/",
    // path: { en: "/", fr: "/", de: "/" },
    component: HomePage,
  },
  {
    path: "/blog/:id",
    //path: { en: "/blog/:id", fr: "/blog-fr/:id", de: "/blog-de/:id" },
    component: ArticlePage,
    props: {
      color: "red",
    },
  },
  {
    path: "/about",
    //path: { en: "/about", fr: "/a-propos", de: "/uber" },
    component: AboutPage,
    children: [
      {
        path: "/foo",
        // path: { en: "/foo", fr: "/foo-fr", de: "/foo-de" },
        component: FooPage,
      },
      {
        path: "/bar",
        component: BarPage,
      },
    ],
  },
  {
    path: "/:rest",
    component: NotFoundPage,
  },
];
