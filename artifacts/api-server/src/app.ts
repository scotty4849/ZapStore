import expressMySQL from "express-mysql-session";
import session from "express-session";
const MySQLStore = expressMySQL(session as any);

// replace the session() middleware with:
app.use(
  session({
    store: new MySQLStore({
      host: "localhost",
      user: "luqlgbjq_Zapps",
      password: process.env.DB_PASSWORD,
      database: "luqlgbjq_Zapps",
    }),
    secret: process.env.SESSION_SECRET || "zapstore-dev-secret-xscxrx",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true,
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "lax",
    },
  }),
);
