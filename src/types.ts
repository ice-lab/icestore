export interface React {
    useState: () => any;
    useEffect: (fun: () => void) => void;
}