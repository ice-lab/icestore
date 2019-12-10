export default function warning(message: string) {
  if (process.env.NODE_ENV !== 'production') {
    console.error(message);
  }
}
