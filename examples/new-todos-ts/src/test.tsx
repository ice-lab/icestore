
function Test() {
  const [count, setCount] = useState(0);

  // const add = async (value) => {
  //   const append: number = await new Promise(resolve =>
  //     setTimeout(() => {
  //       resolve(2);
  //     }, 1000),
  //   );
  //   setCount(count + value + append);
  // };

  const [ value, add ] = useState(0);
  useEffect(() => {
    async function getAppend() {
      const append: number = await new Promise(resolve =>
        setTimeout(() => {
          resolve(2);
        }, 1000),
      );
      setCount(count + value + append);
    }

    getAppend();
  }, [value]);

  return (
    <div>
      <span>{count}</span>
      <button onClick={() => add(2)}>+</button>
    </div>
  );
}
