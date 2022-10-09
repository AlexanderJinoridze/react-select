import { useState, useEffect } from "react";
import Select from "./components/Select";

function App() {
    const [selectedFruits, setSelectedFruits] = useState("");
    const [selectedVegies, setSelectedVegies] = useState([]);
    const [selectedBreadNMeat, setSelectedBreadNMeat] = useState("");

    useEffect(() => {
        console.log('selectedFruits', selectedFruits);
        console.log('selectedVegies', selectedVegies);
        console.log('selectedBreadNMeat', selectedBreadNMeat);
    }, [selectedFruits, selectedVegies, selectedBreadNMeat]);

    const fruits = {
        grapes: "🍇 Grapes",
        melon: "🍈 Melon",
        watermelon: "🍉 Watermelon",
        tangerine: "🍊 Tangerine",
        lemon: "🍋 Lemon",
        banana: "🍌 Banana",
        pineapple: "🍍 Pineapple",
        mango: "🥭 Mango",
        apple: "🍎 Apple",
        pear: "🍐 Pear",
        peach: "🍑 Peach",
        strawberry: "🍓 Strawberry"
    }

    const vegies = {
        tomato: "🍅 Tomato",
        avocado: "🥑 Avocado",
        eggplant: "🍆 Eggplant",
        potato: "🥔 Potato",
        carrot: "🥕 Carrot",
        corn: "🌽 Ear of Corn",
        hotPepper: "🌶️ Hot Pepper",
        cucumber: "🥒 Cucumber",
        leafyGreen: "🥬 Leafy Green",
        broccoli: "🥦 Broccoli",
        garlic: "🧄 Garlic",
        onion: "🧅 Onion"
    }

    const breadNMeat = {
        bread: "🍞 Bread",
        croissant: "🥐 Croissant",
        baguette: "🥖 Baguette Bread",
        pretzel: "🥨 Pretzel",
        bagel: "🥯 Bagel",
        waffle: "🧇 Waffle",
        meatOnBone: "🍖 Meat on Bone",
        poultryLeg: "🍗 Poultry Leg",
        cutOfMeat: "🥩 Cut of Meat",
        bacon: "🥓 Bacon",
        hamburger: "🍔 Hamburger",
        hotdog: "🌭 Hot Dog"
    }

    return (
        <div className="App">
            <h1 className="app-title">React Select</h1>
            <div className="fieldset">
                <strong className="fieldset__title">Fruits</strong>
                <Select
                    options={fruits}
                    value={selectedFruits}
                    onChange={value => setSelectedFruits(value)}
                    placeholder="Select Fruits"
                />
            </div>
            <div className="fieldset">
                <strong className="fieldset__title">Vegies</strong>
                <Select
                    options={vegies}
                    value={selectedVegies}
                    onChange={value => setSelectedVegies(value)}
                    customOption={(value, label) =>
                        <div>
                            <pre>{value}</pre>
                            <strong>{label}</strong>
                        </div>
                    }
                    placeholder="Select Vegies"
                    withCheck="multiple"
                    withSearch
                />
            </div>
            <div className="fieldset">
                <strong className="fieldset__title">Bread n Meat</strong>
                <Select
                    options={breadNMeat}
                    value={selectedBreadNMeat}
                    onChange={value => setSelectedBreadNMeat(value)}
                    placeholder="Select Meat and Bread"
                    withCheck="single"
                />
            </div>
        </div>
    );
}

export default App;
