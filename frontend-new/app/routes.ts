import { type RouteConfig, index, route} from "@react-router/dev/routes";

export default [
    index("routes/explore.tsx"), 
    route("compare", "routes/compare.tsx"),
    route("favourites", "routes/favourites.tsx"),
    route("profile", "routes/profile.tsx"),
] satisfies RouteConfig;
