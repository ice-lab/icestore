import { useContext, createContext } from "react";
import Dispatcher from "./dispatcher";

export default function() {
  const ReactIcestoreContext = createContext(null);

  if (process.env.NODE_ENV !== "production") {
    ReactIcestoreContext.displayName = "ReactIcestore";
  }

  function useIcestoreContext(): Dispatcher {
    const contextValue = useContext(ReactIcestoreContext);

    if (process.env.NODE_ENV !== "production" && !contextValue) {
      throw new Error(
        "could not find icestore context value; please ensure the component is wrapped in a <Provider>",
      );
    }

    return contextValue as Dispatcher;
  }

  return {
    context: ReactIcestoreContext,
    useContext: useIcestoreContext,
  };
}
