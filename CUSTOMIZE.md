This app has been expanded beyond the "getting started" guide to make it easier to customize. To provide your own configuration:

- Update the values used in the `.env` file to match your own configuration.
- Do an `npm run build` to apply those changes.

For most cases, that is it.

If you need to change the paths returned in the redict URI or logout URL then you may need to modify the routing in the application.

In other words, for these values:

```
VITE_LOGOUTURLMOBILE=${SCHEME}://login
VITE_REDIRECTURIMOBILE=${SCHEME}://login
VITE_LOGOUTURLWEB=${DEVURL}/login
VITE_REDIRECTURIWEB=${DEVURL}/login
```

If you need a route other than `login`, then you will also need to adjust the routing within the app so the route exists.
