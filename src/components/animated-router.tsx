import React, { useMemo } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

export interface AnimatedRoute {
  path: string;
  Component: React.ComponentType;
}

export function AnimatedRouter({
  initialRoutes,
  routes,
}: {
  initialRoutes: string[];
  routes: AnimatedRoute[];
}) {
  const routeBody = useMemo(() => {
    return routes.map(({ path, Component }) => (
      <Route key={path} path={path} Component={Component} />
    ));
  }, [routes]);

  return (
    <MemoryRouter initialEntries={initialRoutes}>
      <Routes>{routeBody}</Routes>
    </MemoryRouter>
  );
}
