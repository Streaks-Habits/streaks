import { Router } from 'express'

import { apiCheckKey, apiStateSet } from './api'
import {
	calendarComponent,
	calendarSettingsComponent,
	dashboardView,
	index,
	servePublic,
	stateSet,
	checkAuthenticated,
	loginView,
	loginForm,
	settingsView
} from './controller'

const router = Router()

/// API ///
router.post('/api/*', apiCheckKey)
router.post('/api/set_state/:id', apiStateSet)

/// APP ///
router.use('/', servePublic)
router.get('/login', loginView)
router.post('/login', loginForm)
router.use('/', checkAuthenticated)
router.get('/', index)
router.get('/dashboard', dashboardView)
router.get('/settings', settingsView)
router.post('/set_state/:id', stateSet)
router.get('/components/calendars/:id', calendarComponent)
router.get('/components/settings/calendars/:id', calendarSettingsComponent)

export default router
