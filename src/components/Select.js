import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import scrollIntoView from "scroll-into-view-if-needed";

export default function Select({
    options: initialOptions,
    value,
    onChange,
    customOption,
    placeholder,
    className,
    classNamePrefix,
    withCheck,
    withSearch,
}) {
    const [uniqueID, setUniqueID] = useState();
    const [dropDownOn, setDropDownOn] = useState(false);
    const [search, setSearch] = useState("");
    const [options, setOptions] = useState({});
    const [selected, setSelected] = useState("");
    const [selectedItems, setSelectedItems] = useState("");
    const [highlightedOption, setHighlightedOption] = useState("");

    const selectRef = useRef(null);

    const getSearchResults = () => {
        let searchResults = {};

        for (const [value, label] of Object.entries(initialOptions)) {
            if (label.toLowerCase().includes(search.toLowerCase())) {
                searchResults[value] = label;
            }
        }

        return searchResults;
    };

    const getPlaceholder = () => {
        if (withCheck) {
            if (!selected.length) return placeholder;
            if (withCheck === "single") return options[selected];

            return selected.map((value) => initialOptions[value]).join(", ");
        } else {
            if (!selected) return placeholder;

            return options[selected];
        }
    };

    const onClick = (value) => {
        setSelected(value);
        setDropDownOn(false);

        onChange(value);
    };

    const handleChange = (value) => {
        if (withCheck === "single") {
            selectRef.current.querySelectorAll(".select__button")[0].focus();
            setSelected(selected === value ? "" : value);
            onChange(value);
        } else if (withCheck === "multiple") {
            const newSelected = [...selected];
            selectRef.current.querySelectorAll(".select__search")[0].focus();
            if (newSelected.includes(value)) {
                newSelected.splice(newSelected.indexOf(value), 1);
            } else {
                newSelected.push(value);
            }
            setSelected(newSelected);
            onChange(newSelected);
        }
    };

    const onBlur = (e) => {
        if (e.relatedTarget && !selectRef.current.contains(e.relatedTarget)) {
            setDropDownOn(false);
        }
    };

    const onKeyDown = (e) => {
        const keyCode = e.keyCode;

        if (keyCode === 13) {
            if (withCheck) {
                handleChange(highlightedOption);
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

            scrollIntoView(
                selectRef.current.querySelector(
                    `.${classNamePrefix}__menu [data-value=${value}]`
                ),
                {
                    scrollMode: "if-needed",
                    block: "nearest",
                    inline: "nearest",
                }
            );
        }
    };

    const onClickOutside = (event) => {
        if (selectRef.current && !selectRef.current.contains(event.target)) {
            setDropDownOn(false);
        }
    };

    useEffect(() => {
        setUniqueID(Math.random().toString(16).slice(2));

        document.addEventListener("click", onClickOutside, true);
        return () => {
            document.removeEventListener("click", onClickOutside, true);
        };
    }, []);

    useEffect(() => {
        setSelected(value);
    }, [value]);

    useEffect(() => {
        setOptions(
            withCheck === "multiple" ? getSearchResults() : initialOptions
        );
    }, [initialOptions]);

    useEffect(() => {
        setSelectedItems(getPlaceholder());
    }, [selected]);

    useEffect(() => {
        setSearch("");
    }, [dropDownOn]);

    useEffect(() => {
        setOptions(getSearchResults());
    }, [search]);

    const generateOptions = () => {
        if (!Object.keys(options).length) {
            return (
                <div className={`${classNamePrefix}__no-res`}>
                    List is Empty
                </div>
            );
        }

        if (withCheck) {
            return Object.keys(options).map((value, index) => {
                const label = options[value];
                const labelID = `${uniqueID}__${value}`;

                return (
                    <label
                        key={index}
                        data-value={value}
                        className={`${classNamePrefix}__menu-item${
                            value === highlightedOption
                                ? ` ${classNamePrefix}__menu-item--highlighted`
                                : ""
                        }`}
                        onMouseEnter={() => setHighlightedOption(value)}
                        htmlFor={labelID}
                    >
                        <input
                            id={labelID}
                            tabIndex="-1"
                            type="checkbox"
                            checked={
                                withCheck === "single"
                                    ? selected === value
                                    : selected.includes(value)
                            }
                            onChange={() => handleChange(value)}
                        />
                        {customOption ? (
                            customOption(value, label)
                        ) : (
                            <div>{label}</div>
                        )}
                    </label>
                );
            });
        } else {
            return Object.keys(options).map((value, index) => {
                const label = options[value];

                return (
                    <div
                        key={index}
                        data-value={value}
                        className={`${classNamePrefix}__menu-item${
                            value === highlightedOption
                                ? ` ${classNamePrefix}__menu-item--highlighted`
                                : ""
                        }${
                            value === selected
                                ? ` ${classNamePrefix}__menu-item--selected`
                                : ""
                        }`}
                        onMouseEnter={() => setHighlightedOption(value)}
                        onClick={() => onClick(value)}
                    >
                        {customOption ? (
                            customOption(value, label)
                        ) : (
                            <div>{label}</div>
                        )}
                    </div>
                );
            });
        }
    };

    const selectButton = () => {
        return (
            <div
                className={`${classNamePrefix}__button`}
                tabIndex="0"
                onMouseUp={() => setDropDownOn(!dropDownOn)}
                onKeyDown={(e) => {
                    e.stopPropagation();

                    if (dropDownOn) {
                        if (e.keyCode === 38 || e.keyCode === 40)
                            e.preventDefault();

                        onKeyDown(e);
                    }

                    if (!(withCheck && dropDownOn)) {
                        e.keyCode === 13 && setDropDownOn(!dropDownOn);
                    }
                }}
                onBlur={onBlur}
            >
                <div className={`${classNamePrefix}__value`}>
                    <span>{selectedItems}</span>
                </div>
                <div className={`${classNamePrefix}__arrow`}>
                    <span
                        className={`${classNamePrefix}__icon ${classNamePrefix}__icon--arrow-down`}
                    ></span>
                </div>
            </div>
        );
    };

    const selectSearch = () => {
        return (
            <div className={`${classNamePrefix}__button`}>
                <input
                    type="text"
                    className={`${classNamePrefix}__search`}
                    autoFocus
                    value={search}
                    placeholder="Search..."
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.keyCode === 13 && !highlightedOption)
                            e.stopPropagation();
                    }}
                    onFocus={() => setDropDownOn(true)}
                    onBlur={onBlur}
                />
                <div className={`${classNamePrefix}__arrow`}>
                    {withCheck === "multiple" && (
                        <button
                            className={`${classNamePrefix}__btn`}
                            onClick={() => setSelected([])}
                            onKeyDown={(e) => {
                                if (e.keyCode === 13) {
                                    e.stopPropagation();
                                    setSelected([]);
                                }
                            }}
                            onBlur={onBlur}
                        >
                            <span
                                className={`${classNamePrefix}__icon ${classNamePrefix}__icon--clear`}
                            ></span>
                        </button>
                    )}
                    <button
                        className={`${classNamePrefix}__btn`}
                        onClick={() => setDropDownOn(false)}
                        onKeyDown={(e) => {
                            if (e.keyCode === 13) {
                                e.stopPropagation();
                                setDropDownOn(false);
                            }
                        }}
                        onBlur={onBlur}
                    >
                        <span
                            className={`${classNamePrefix}__icon ${classNamePrefix}__icon--x`}
                        ></span>
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div
            ref={selectRef}
            onKeyDown={onKeyDown}
            className={`${classNamePrefix} ${className}`}
        >
            {dropDownOn ? (
                <>
                    {withSearch ? selectSearch() : selectButton()}
                    <div className={`${classNamePrefix}__menu`}>
                        {generateOptions()}
                    </div>
                </>
            ) : (
                selectButton()
            )}
        </div>
    );
}

Select.propTypes = {
    options: PropTypes.objectOf(PropTypes.string).isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.array]).isRequired,
    onChange: PropTypes.func.isRequired,
    customOption: PropTypes.func,
    placeholder: PropTypes.string,
    className: PropTypes.string,
    classNamePrefix: PropTypes.string,
    withCheck: PropTypes.oneOf(["multiple", "single"]),
};

Select.defaultProps = {
    placeholder: "",
    className: "",
    classNamePrefix: "select",
};
