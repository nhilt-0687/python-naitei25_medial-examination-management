import { useNavigate } from "react-router"

export default function ReturnButton() {
    const navigate = useNavigate();

    const handleReturn = () => {
        navigate(-1);
    };

    return (
        <button 
            onClick={handleReturn}
            className="border-[1.5px] border-base-600 border-dashed rounded-sm text-lg px-2 py-1 bg-white mr-3"
        >←</button>
    )

}