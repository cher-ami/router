import { TRoute } from "..";

export const routeList: TRoute[] = [
  {
    path: "/",
    name: "HomePage",
    children: [
      {
        path: "/hello-2",
        name: "Hello2Page",
      },
    ],
  },
  {
    path: "/bar/:id",
    name: "BarPage",
    props: {
      color: "blue",
    },
  },

  {
    path: "/hello",
    name: "HelloPage",
    getStaticProps: async (props, currentLang) =>
      new Promise((resolve) => {
        setTimeout(() => {
          resolve({ data: {} });
        }, 100);
      }),
    children: [
      {
        path: "/bar",
        name: "BarPage",
      },
      {
        path: "/foo",
        name: "FooPage",
        children: [
          {
            path: "/",
            name: "FirstLevelRoute",
          },
          {
            path: "/zoo/:id?",
            name: "ZooPage",
          },
          {
            path: "/bla",
            name: "BlaPage",
            children: [
              {
                path: "/",
                name: "FirstLevelRoute-2",
              },
              {
                path: "/yes",
                name: "YesPage",
              },
              {
                path: "/no",
                name: "NoPage",
                getStaticProps: async (props) =>
                  new Promise((resolve) => {
                    setTimeout(() => {
                      resolve({ fetchData: {} });
                    }, 100);
                  }),
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: "/about",
    name: "AboutPage",
    children: [
      {
        path: "/route2",
        name: "Route2Page",
        children: [
          {
            path: "/:testParam?",
            children: [
              {
                path: "/foo4",
                props: { color: "red" },
                name: "Foo4Page",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: "/end",
    name: "EndPage",
  },
  {
    path: "/test-hash#:hash?",
    name: "HashPage",
  },
  {
    path: "/:rest",
    name: "NotFoundPage",
  },
];
