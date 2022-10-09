import { useState, useEffect, useRef } from "react";
import PropTypes from 'prop-types';
import scrollIntoView from "scroll-into-view-if-needed";

export default function Select(props) {

    const [uniqueID, setUniqueID] = useState();
    const [dropDownOn, setDropDownOn] = useState(false);
    const [search, setSearch] = useState("");
    const [options, setOptions] = useState({});
    const [selected, setSelected] = useState("");
    const [placeholder, setPlaceholder] = useState("");
    const [highlightedOption, setHighlightedOption] = useState("");

    const selectRef = useRef(null);


    const getSearchResults = () => {
        let searchResults = {};

        for (const [value, label] of Object.entries(props.options)) {
            if (label.toLowerCase().includes(search.toLowerCase())) {
                searchResults[value] = label;
            }
        }

        return searchResults;
    }

    const getPlaceholder = () => {
        if (props.withCheck) {
            if (!selected.length) return props.placeholder;
            if (props.withCheck === "single") return options[selected];

            return selected.map(value => props.options[value]).join(", ");
        } else {
            if (!selected) return props.placeholder;

            return options[selected];
        }
    }



    const onClick = (value) => {
        setSelected(value);
        setDropDownOn(false);

        props.onChange(value);
    }

    const onChange = (value) => {
        if (props.withCheck === "single") {
            setSelected(selected === value ? "" : value);
            props.onChange(value);
        }
        if (props.withCheck === "multiple") {
            const newSelected = [...selected];
            if (newSelected.includes(value)) {
                newSelected.splice(newSelected.indexOf(value), 1);
            } else {
                newSelected.push(value)
            }
            setSelected(newSelected);
            props.onChange(newSelected);
        }
    }

    const onBlur = (e) => {
        if (e.relatedTarget && !selectRef.current.contains(e.relatedTarget)) {
            setDropDownOn(false);
        }
    }

    const onKeyDown = (e) => {
        const keyCode = e.keyCode;

        if (keyCode === 13) {
            if (props.withCheck) {
                onChange(highlightedOption);
            } else {
                onClick(highlightedOption);
            }
        }

        if (keyCode === 38 || keyCode === 40) {
            e.preventDefault();
            let index;
            let value;
            let currentIndex = Object.keys(options).indexOf(highlightedOption);
            let lastIndex = Object.keys(options).length - 1;

            if (keyCode === 38) {
                index = currentIndex - 1;
            }

            if (keyCode === 40) {
                index = currentIndex + 1;
            }

            if (index < 0) {
                index = lastIndex;
            }

            if (index > lastIndex) {
                index = 0;
            }

            value = Object.keys(options)[index];

            setHighlightedOption(value);

            scrollIntoView(selectRef.current.querySelector(`.${props.classNamePrefix}__menu [data-value=${value}]`), {
                scrollMode: "if-needed",
                block: "nearest",
                inline: "nearest",
            })
        }
    }

    const onClickOutside = (event) => {
        if (selectRef.current && !selectRef.current.contains(event.target)) {
            setDropDownOn(false);
        }
    }


    useEffect(() => {
        setUniqueID(Math.random().toString(16).slice(2));

        document.addEventListener("click", onClickOutside, true);
        return () => {
            document.removeEventListener("click", onClickOutside, true);
        };
    }, []);

    useEffect(() => {
        setSelected(props.value);
    }, [props.value]);

    useEffect(() => {
        setOptions(props.withCheck === "multiple" ? getSearchResults() : props.options);
    }, [props.options]);

    useEffect(() => {
        setPlaceholder(getPlaceholder());
    }, [selected]);

    useEffect(() => {
        setSearch("");
    }, [dropDownOn]);

    useEffect(() => {
        setOptions(getSearchResults());
    }, [search]);


    const generateOptions = () => {
        if (!Object.keys(options).length) {
            return <div className={`${props.classNamePrefix}__no-res`}>List is Empty</div>
        }

        if (props.withCheck) {
            return Object.keys(options).map((value, index) => {
                const label = options[value];
                const labelID = `${uniqueID}__${value}`;

                return <label
                    key={index}
                    data-value={value}
                    className={`${props.classNamePrefix}__menu-item${value === highlightedOption ? ` ${props.classNamePrefix}__menu-item--highlighted` : ""}`}
                    onMouseEnter={() => setHighlightedOption(value)}
                    htmlFor={labelID}
                >
                    <input
                        id={labelID}
                        tabIndex="-1"
                        type="checkbox"
                        checked={props.withCheck === "single" ? selected === value : selected.includes(value)}
                        onChange={() => onChange(value)}
                    />
                    {props.drawOption ? props.drawOption(value, label) : <div>{label}</div>}
                </label>
            })
        } else {
            return Object.keys(options).map((value, index) => {
                const label = options[value];

                return <div
                    key={index}
                    data-value={value}
                    className={`${props.classNamePrefix}__menu-item${value === highlightedOption ? ` ${props.classNamePrefix}__menu-item--highlighted` : ""}${value === selected ? ` ${props.classNamePrefix}__menu-item--selected` : ""}`}
                    onMouseEnter={() => setHighlightedOption(value)}
                    onClick={() => onClick(value)}
                >
                    {props.drawOption ? props.drawOption(value, label) : <div>{label}</div>}
                </div>
            })
        }
    }

    const selectButton = () => {
        return <div
            className={`${props.classNamePrefix}__button`}
            tabIndex="0"
            onMouseUp={() => setDropDownOn(!dropDownOn)}
            onKeyDown={e => {
                e.stopPropagation();

                if (dropDownOn) {
                    if (e.keyCode === 38 || e.keyCode === 40) e.preventDefault();

                    onKeyDown(e);
                }

                if (!(props.withCheck && dropDownOn)) {
                    e.keyCode === 13 && setDropDownOn(!dropDownOn)
                }
            }}
            onBlur={onBlur}
        >
            <div className={`${props.classNamePrefix}__value`}>
                <span>{placeholder}</span>
            </div>
            <div className={`${props.classNamePrefix}__arrow`}>
                <span className={`${props.classNamePrefix}__icon ${props.classNamePrefix}__icon--arrow-down`}></span>
            </div>
        </div>
    }

    const selectSearch = () => {
        return <div className={`${props.classNamePrefix}__button`}>
            <input
                type="text"
                className={`${props.classNamePrefix}__search`}
                autoFocus
                value={search}
                placeholder="Search..."
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => { if (e.keyCode === 13 && !highlightedOption) e.stopPropagation() }}
                onFocus={() => setDropDownOn(true)}
                onBlur={onBlur}
            />
            <div className={`${props.classNamePrefix}__arrow`}>
                {
                    props.withCheck === "multiple" &&
                    <button
                        className={`${props.classNamePrefix}__btn`}
                        onClick={() => setSelected([])}
                        onKeyDown={e => { if (e.keyCode === 13) { e.stopPropagation(); setSelected([]) } }}
                        onBlur={onBlur}
                    >
                        <span className={`${props.classNamePrefix}__icon ${props.classNamePrefix}__icon--clear`}></span>
                    </button>
                }
                <button
                    className={`${props.classNamePrefix}__btn`}
                    onClick={() => setDropDownOn(false)}
                    onKeyDown={e => { if (e.keyCode === 13) { e.stopPropagation(); setDropDownOn(false) } }}
                    onBlur={onBlur}
                >
                    <span className={`${props.classNamePrefix}__icon ${props.classNamePrefix}__icon--x`}></span>
                </button>
            </div>
        </div>
    }

    return (
        <div
            ref={selectRef}
            onKeyDown={onKeyDown}
            className={`${props.classNamePrefix} ${props.className}`}
        >
            {dropDownOn ?
                <>
                    {props.withSearch ? selectSearch() : selectButton()}
                    <div className={`${props.classNamePrefix}__menu`}>{generateOptions()}</div>
                </>
                : selectButton()
            }
        </div>
    )
}

Select.propTypes = {
    options: PropTypes.objectOf(PropTypes.string).isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.array]).isRequired,
    onChange: PropTypes.func.isRequired,
    customOption: PropTypes.func,
    placeholder: PropTypes.string,
    className: PropTypes.string,
    classNamePrefix: PropTypes.string,
    withCheck: PropTypes.oneOf(['multiple', 'single'])
}

Select.defaultProps = {
    placeholder: "",
    className: "",
    classNamePrefix: "select"
}