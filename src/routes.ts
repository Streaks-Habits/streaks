import { Router } from 'express'

import { calendarView, dashboardView, index, servePublic, serveStyles, stateSet, checkAuthenticated, loginView, loginForm } from './controller'

const router = Router()

router.use("/", servePublic)
router.use("/", serveStyles)
router.get("/login", loginView)
router.post("/login", loginForm)
router.use("/", checkAuthenticated)
router.get("/", index)
router.get("/dashboard", dashboardView)
/// API ///
router.get("/api/set_state/:id/:dateString/:state", stateSet)
router.get("/api/calendar_view/:id", calendarView)

export default router
