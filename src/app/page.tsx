"use client";
import { ThemeSwitcher } from "./components/ThemeSwitcher";
import styles from "./HomePage.module.css";


export default function HomePage() {

  return (
    <div className={styles.content}>
      <main className={styles.main}>
        <h1 className={styles.h1}>The holy beacon is under development. We will be up soon!</h1>
        <h2 className={styles.h2}>Feel free to contact us to theholybeacon@gmail.com</h2>
        <ThemeSwitcher />
      </main>
    </div>
  );
}
