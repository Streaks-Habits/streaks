import { Router } from 'express'

import { calendarView, dashboardView, index, servePublic, serveStyles, stateSet, checkAuthenticated, loginView, loginForm } from './controller'

const router = Router()

router.use("/", servePublic)
router.use("/", serveStyles)
router.get("/login", loginView)
router.post("/login", loginForm)
router.use("/", checkAuthenticated)
router.get("/", index)
router.get("/calendar/:filename", calendarView)
router.get("/dashboard", dashboardView)
router.get("/set_state/:filename/:dateString/:state", stateSet)

export default router
