import Link from "next/link";
import styles from "./bottomNav.module.css";

export default function NavItem({
  href,
  label,
  Icon,
  ActiveIcon,
  isActive,
  onClick,
  asButton = false,
}) {
  const iconNode = isActive && ActiveIcon ? <ActiveIcon size={22} /> : <Icon size={22} />;

  if (asButton) {
    return (
      <button
        type="button"
        className={`${styles.navItem} ${isActive ? styles.navItemActive : ""}`}
        onClick={onClick}
        aria-label={label}
      >
        <span className={styles.iconWrap}>{iconNode}</span>
        <span className={styles.label}>{label}</span>
      </button>
    );
  }

  return (
    <Link
      href={href}
      className={`${styles.navItem} ${isActive ? styles.navItemActive : ""}`}
      onClick={onClick}
      aria-label={label}
    >
      <span className={styles.iconWrap}>{iconNode}</span>
      <span className={styles.label}>{label}</span>
    </Link>
  );
}
