import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Leaf, User, Mail, Lock, ChevronDown, ArrowRight } from 'lucide-react'
import LightPillar from '../components/react-bits/LightPillar'
import { SpecularButton } from '../components/specular-button'
import { useTheme } from '../components/theme-provider'

const inputClass =
  'w-full bg-surface-container-lowest dark:bg-surface-container-high border border-outline-variant text-on-surface text-base rounded-full py-3 pl-12 pr-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors'

export default function Signup() {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const dark = theme === 'dark'

  const [errors, setErrors] = useState({})

  const pillar = dark
    ? { topColor: '#6ff7df', bottomColor: '#003f36' }
    : { topColor: '#00796b', bottomColor: '#d8fff4' }

  const validate = (formData) => {
    const next = {}
    const name = formData.get('name').trim()
    const email = formData.get('email').trim()
    const password = formData.get('password')
    const confirm = formData.get('confirm')
    const role = formData.get('role')
    const terms = formData.get('terms')

    if (!name) next.name = 'Full name is required.'
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = 'Enter a valid email address.'
    if (password.length < 8) next.password = 'Password must be at least 8 characters.'
    if (confirm !== password) next.confirm = 'Passwords do not match.'
    if (!role) next.role = 'Select your role.'
    if (!terms) next.terms = 'You must accept the terms to continue.'
    return next
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const next = validate(formData)
    setErrors(next)
    if (Object.keys(next).length === 0) {
      navigate('/dashboard')
    }
  }

  const fieldError = (key) =>
    errors[key] ? (
      <p className="text-sm text-error mt-1 ml-4" role="alert">
        {errors[key]}
      </p>
    ) : null

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-background">
      <LightPillar
        className="absolute inset-0"
        topColor={pillar.topColor}
        bottomColor={pillar.bottomColor}
        intensity={0.9}
        rotationSpeed={0.25}
        glowAmount={0.005}
        noiseIntensity={0.4}
        pillarWidth={3.0}
        pillarHeight={0.4}
        interactive
        quality="high"
      />

      <main className="relative z-10 flex-grow flex items-center justify-center w-full px-6 md:px-10 py-12">
        <div className="bg-surface-container-low dark:bg-surface-container/80 rounded-2xl p-8 w-full max-w-md shadow-[0_4px_8px_rgba(0,104,91,0.04)] border border-outline-variant backdrop-blur-sm">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4 text-primary">
              <Leaf size={48} aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-semibold text-primary mb-2">
              Create Account
            </h1>
            <p className="text-sm text-on-surface-variant">
              Join Smart Eco-Pharma Hub
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            {Object.keys(errors).length > 0 && (
              <div
                className="bg-error-container text-on-error-container rounded-lg p-3 text-sm mb-2"
                role="alert"
                tabIndex="-1"
              >
                Please fix the errors below before continuing.
              </div>
            )}

            <div>
              <label className="block text-sm text-on-surface-variant mb-1 ml-4" htmlFor="name">
                Full Name
              </label>
              <div className="relative">
                <User
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant"
                  aria-hidden="true"
                />
                <input
                  className={inputClass}
                  id="name"
                  name="name"
                  placeholder="e.g. Dr. Sarah Jenkins"
                  autoComplete="name"
                  type="text"
                />
              </div>
              {fieldError('name')}
            </div>

            <div>
              <label className="block text-sm text-on-surface-variant mb-1 ml-4" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant"
                  aria-hidden="true"
                />
                <input
                  className={inputClass}
                  id="email"
                  name="email"
                  placeholder="Enter your email"
                  autoComplete="email"
                  type="email"
                />
              </div>
              {fieldError('email')}
            </div>

            <div>
              <label className="block text-sm text-on-surface-variant mb-1 ml-4" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant"
                  aria-hidden="true"
                />
                <input
                  className={inputClass}
                  id="password"
                  name="password"
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
                  type="password"
                />
              </div>
              {fieldError('password')}
            </div>

            <div>
              <label className="block text-sm text-on-surface-variant mb-1 ml-4" htmlFor="confirm">
                Confirm Password
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant"
                  aria-hidden="true"
                />
                <input
                  className={inputClass}
                  id="confirm"
                  name="confirm"
                  placeholder="Repeat password"
                  autoComplete="new-password"
                  type="password"
                />
              </div>
              {fieldError('confirm')}
            </div>

            <div>
              <label className="block text-sm text-on-surface-variant mb-1 ml-4" htmlFor="role">
                Role
              </label>
              <div className="relative">
                <ChevronDown
                  size={18}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none"
                  aria-hidden="true"
                />
                <select className={inputClass + ' appearance-none'} id="role" name="role" defaultValue="">
                  <option value="" disabled>
                    Select your role
                  </option>
                  <option value="pharmacist">Pharmacist</option>
                  <option value="technician">Pharmacy Technician</option>
                  <option value="manager">Branch Manager</option>
                  <option value="admin">System Admin</option>
                </select>
              </div>
              {fieldError('role')}
            </div>

            <div className="px-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  className="h-4 w-4 text-primary border-outline-variant rounded focus:ring-primary"
                  type="checkbox"
                  id="terms"
                  name="terms"
                />
                <span className="text-sm text-on-surface-variant">
                  I agree to the Terms of Service and Privacy Policy
                </span>
              </label>
              {fieldError('terms')}
            </div>

            <SpecularButton size="lg" className="w-full justify-center" type="submit">
              Create Account
              <ArrowRight size={18} />
            </SpecularButton>

            <p className="mt-4 text-center text-sm text-on-surface-variant">
              Already have an account?{' '}
              <Link to="/login" className="text-sm text-primary hover:text-primary-container transition-colors">
                Sign In
              </Link>
            </p>
          </form>
        </div>
      </main>

      <footer className="relative z-10 w-full py-4 text-center">
        <p className="text-xs text-on-surface-variant">
          Smart Eco-Pharma Hub v0.1.0 © 2024
        </p>
      </footer>
    </div>
  )
}
