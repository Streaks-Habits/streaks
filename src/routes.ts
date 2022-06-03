import { Router } from 'express'

import { apiCheckKey, apiStateSet } from './api'
import { calendarView, dashboardView, index, servePublic, serveStyles, stateSet, checkAuthenticated, loginView, loginForm } from './controller'

const router = Router()

/// API ///
router.post("/api/*", apiCheckKey)
router.post("/api/set_state/:id", apiStateSet)

/// APP ///
router.use("/", servePublic)
router.use("/", serveStyles)
router.get("/login", loginView)
router.post("/login", loginForm)
router.use("/", checkAuthenticated)
router.get("/", index)
router.get("/dashboard", dashboardView)
router.post("/set_state/:id", stateSet)
router.get("/calendar_view/:id", calendarView)

export default router
