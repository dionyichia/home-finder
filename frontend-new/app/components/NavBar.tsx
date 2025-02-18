import { Link } from "react-router"

export default function NavBar() {
    return (
        <div className="flex flex-col no-wrap justify-items-start">
            <div>
                <Link to="/"> Explore </Link>
            </div>
            <div>
                <Link to="/compare"> Compare </Link>
            </div>
            <div>
                <Link to="/favourites"> Favourites </Link>
            </div>
        </div>
    );
}