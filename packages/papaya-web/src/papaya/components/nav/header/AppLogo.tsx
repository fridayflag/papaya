import { Link } from '@tanstack/react-router'

export default function AppLogo() {
  return (
    <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
      <img src="/images/papaya/g3.png" height={32} style={{ display: 'block' }} />
    </Link>
  )
}
