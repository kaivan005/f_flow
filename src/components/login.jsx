import { useMemo, useState } from 'react'

const ROLE_COPY = {
	manager: {
		label: 'Manager',
		detail: 'Full visibility across depots, approvals, and audit logs.',
	},
	dispatcher: {
		label: 'Dispatcher',
		detail: 'Route execution, live updates, and schedule adjustments.',
	},
}

function Login() {
	const [role, setRole] = useState('manager')
	const roleCopy = useMemo(() => ROLE_COPY[role], [role])

	return (
		<section className="login">
			<header className="login__header">
				<div className="login__badge">FlowSecure</div>
				<div>
					<p className="login__eyebrow">Login & Authentication</p>
					<h1>Secure access for every shift.</h1>
					<p className="login__subhead">
						Enforce role-based access for managers and dispatchers with a clear,
						verified sign-in flow.
					</p>
				</div>
			</header>

			<div className="login__grid">
				<form className="login__panel" aria-label="Login form">
					<div className="login__panel-header">
						<h2>Sign in</h2>
						<p>Choose a role to load the correct access profile.</p>
					</div>

					<fieldset className="login__group" aria-label="Role selection">
						<legend>Role</legend>
						<div className="role-toggle" role="radiogroup" aria-label="Select role">
							<label className={`role-toggle__option ${role === 'manager' ? 'is-active' : ''}`}>
								<input
									type="radio"
									name="role"
									value="manager"
									checked={role === 'manager'}
									onChange={() => setRole('manager')}
								/>
								<span>Manager</span>
							</label>
							<label className={`role-toggle__option ${role === 'dispatcher' ? 'is-active' : ''}`}>
								<input
									type="radio"
									name="role"
									value="dispatcher"
									checked={role === 'dispatcher'}
									onChange={() => setRole('dispatcher')}
								/>
								<span>Dispatcher</span>
							</label>
						</div>
					</fieldset>

					<fieldset className="login__group" aria-label="Credentials">
						<legend>Credentials</legend>
						<div className="field">
							<label htmlFor="email">Email address</label>
							<input id="email" type="email" placeholder="name@company.com" required />
						</div>

						<div className="field">
							<label htmlFor="password">Password</label>
							<input id="password" type="password" placeholder="••••••••" required />
						</div>
					</fieldset>

					<div className="field field--inline">
						<label className="checkbox">
							<input type="checkbox" defaultChecked />
							<span>Remember this device</span>
						</label>
						<button type="button" className="link-button">
							Forgot Password
						</button>
					</div>

					<button type="submit" className="primary-button">
						Sign in as {roleCopy.label}
					</button>

					<p className="login__footnote">
						RBAC active: {roleCopy.detail}
					</p>
				</form>

				<aside className="login__aside" aria-live="polite">
					<div className="login__card">
						<p className="login__card-title">Role-Based Access Control</p>
						<p className="login__card-body">
							Assign permissions by role, not by exception. Audit trails, task
							queues, and sensitive controls follow your RBAC matrix.
						</p>
					</div>
					<div className="login__card login__card--accent">
						<p className="login__card-title">Active role</p>
						<p className="login__card-body">
							<strong>{roleCopy.label}</strong>
							<span>{roleCopy.detail}</span>
						</p>
					</div>
					<div className="login__card">
						<p className="login__card-title">Security signals</p>
						<ul>
							<li>Multi-factor prompts when risk elevates.</li>
							<li>Session timeouts on idle dispatch boards.</li>
							<li>Granular permissions for route edits.</li>
						</ul>
					</div>
				</aside>
			</div>
		</section>
	)
}

export default Login
