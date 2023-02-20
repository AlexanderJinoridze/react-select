import { useState, useEffect, useRef, useMemo } from "react";
import PropTypes from "prop-types";
import scrollIntoView from "scroll-into-view-if-needed";
import classNames from "classnames";

import { v4 as uuid } from "uuid";

export default function Select(props) {
    // const [uniqueID, setUniqueID] = useState();
    const [dropDownOn, setDropDownOn] = useState(false);
    const [search, setSearch] = useState("");
    const [options, setOptions] = useState({});
    const [selected, setSelected] = useState("");
    const [placeholder, setPlaceholder] = useState("");
    const [highlightedOption, setHighlightedOption] = useState("");

    const selectRef = useRef(null);

    const uniqueID = useMemo(() => uuid(), []);

    const onClick = (value) => {
        setSelected(value);
        setDropDownOn(false);

        props.onChange(value);
    };

    const onChange = (value) => {
        if (props.withCheck === "single") {
            selectRef.current.querySelectorAll(".select__button")[0].focus();
            setSelected(selected === value ? "" : value);
            props.onChange(value);
        } else if (props.withCheck === "multiple") {
            const newSelected = [...selected];
            selectRef.current.querySelectorAll(".select__search")[0].focus();
            if (newSelected.includes(value)) {
                newSelected.splice(newSelected.indexOf(value), 1);
            } else {
                newSelected.push(value);
            }
            setSelected(newSelected);
            props.onChange(newSelected);
        }
    };

    const onBlur = (e) => {
        if (e.relatedTarget && !selectRef.current.contains(e.relatedTarget)) {
            setDropDownOn(false);
        }
    };

    function onKeyDown(e) {
        if (e.target !== this) {
            return;
        }

        if (e.key === "Enter") {
            if (props.withCheck) {
                onChange(highlightedOption);
            } else {
                onClick(highlightedOption);
            }
        }

        if (e.key === "ArrowUp" || e.key === "ArrowDown") {
            e.preventDefault();
            let index;
            let value;
            let currentIndex = Object.keys(options).indexOf(highlightedOption);
            let lastIndex = Object.keys(options).length - 1;

            if (e.key === "ArrowUp") {
                index = currentIndex - 1;
            } else if (e.key === "ArrowDown") {
                index = currentIndex + 1;
            }

            if (index < 0) {
                index = lastIndex;
            } else if (index > lastIndex) {
                index = 0;
            }

            value = Object.keys(options)[index];

            setHighlightedOption(value);

            scrollIntoView(
                selectRef.current.querySelector(
                    `.${props.classNamePrefix}__menu [data-value=${value}]`
                ),
                {
                    scrollMode: "if-needed",
                    block: "nearest",
                    inline: "nearest",
                }
            );
        }
    }

    // useEffect(() => {
    //     console.log("PROPOPTIONS");
    //     setOptions(
    //         props.withCheck === "multiple" ? getSearchResults() : props.options
    //     );
    // }, [props.options]);

    // useEffect(() => {
    //     setSelected(props.value);
    // }, [props.value]);

    useEffect(() => {
        const onClickOutside = (event) => {
            if (
                selectRef.current &&
                !selectRef.current.contains(event.target)
            ) {
                setDropDownOn(false);
            }
        };

        document.addEventListener("click", onClickOutside, true);
        return () => {
            document.removeEventListener("click", onClickOutside, true);
        };
    }, []);

    useEffect(() => {
        const getPlaceholder = () => {
            if (props.withCheck) {
                if (!selected.length) return props.placeholder;
                if (props.withCheck === "single") return options[selected];

                return selected.map((value) => props.options[value]).join(", ");
            } else {
                if (!selected) return props.placeholder;

                return options[selected];
            }
        };

        setPlaceholder(getPlaceholder());
    }, [selected]);

    useEffect(() => {
        setSearch("");
    }, [dropDownOn]);

    useEffect(() => {
        const getSearchResults = () => {
            let searchResults = {};

            for (const [value, label] of Object.entries(props.options)) {
                if (label.toLowerCase().includes(search.toLowerCase())) {
                    searchResults[value] = label;
                }
            }

            return searchResults;
        };

        setOptions(getSearchResults());
    }, [search]);

    const generateOptions = () => {
        if (!Object.keys(options).length) {
            return (
                <div className={`${props.classNamePrefix}__no-res`}>
                    <span>List is Empty</span>
                </div>
            );
        }

        if (props.withCheck) {
            return Object.keys(options).map((value, index) => {
                const label = options[value];
                const labelID = `${uniqueID}__${value}`;

                return (
                    <label
                        key={index}
                        data-value={value}
                        className={classNames({
                            [`${props.classNamePrefix}__menu-item`]: true,
                            [`${props.classNamePrefix}__menu-item--highlighted`]:
                                value === highlightedOption,
                        })}
                        onMouseEnter={() => setHighlightedOption(value)}
                        htmlFor={labelID}
                    >
                        <input
                            id={labelID}
                            tabIndex="-1"
                            type="checkbox"
                            checked={
                                props.withCheck === "single"
                                    ? selected === value
                                    : selected.includes(value)
                            }
                            onChange={() => onChange(value)}
                        />
                        {props.drawOption ? (
                            props.drawOption(value, label)
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
                        className={classNames({
                            [`${props.classNamePrefix}__menu-item`]: true,
                            [`${props.classNamePrefix}__menu-item--highlighted`]:
                                value === highlightedOption,
                            [`${props.classNamePrefix}__menu-item--selected`]:
                                value === selected,
                        })}
                        onMouseEnter={() => setHighlightedOption(value)}
                        onClick={() => onClick(value)}
                    >
                        {props.drawOption ? (
                            props.drawOption(value, label)
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
                className={`${props.classNamePrefix}__button`}
                tabIndex="0"
                onMouseUp={() => setDropDownOn(!dropDownOn)}
                onKeyDown={(e) => {
                    // e.stopPropagation();

                    if (dropDownOn) {
                        if (e.key === "ArrowUp" || e.key === "ArrowDown")
                            e.preventDefault();

                        onKeyDown(e);
                    }

                    if (!(props.withCheck && dropDownOn)) {
                        e.key === "Enter" && setDropDownOn(!dropDownOn);
                    }
                }}
                onBlur={onBlur}
            >
                <div className={`${props.classNamePrefix}__value`}>
                    <span>{placeholder}</span>
                </div>
                <div className={`${props.classNamePrefix}__arrow`}>
                    <span
                        className={`${props.classNamePrefix}__icon ${props.classNamePrefix}__icon--arrow-down`}
                    ></span>
                </div>
            </div>
        );
    };

    const selectSearch = () => {
        return (
            <div className={`${props.classNamePrefix}__button`}>
                <div>
                    <input
                        type="text"
                        className={`${props.classNamePrefix}__search`}
                        autoFocus
                        value={search}
                        placeholder="Search..."
                        onChange={(e) => setSearch(e.target.value)}
                        // onKeyDown={(e) => {
                        //     if (e.key === "Enter" && !highlightedOption)
                        //         e.stopPropagation();
                        // }}
                        onFocus={() => setDropDownOn(true)}
                        onBlur={onBlur}
                    />
                </div>
                <div className={`${props.classNamePrefix}__arrow`}>
                    {props.withCheck === "multiple" && (
                        <button
                            type="button"
                            className={`${props.classNamePrefix}__btn`}
                            onClick={() => setSelected([])}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    //e.stopPropagation();
                                    setSelected([]);
                                }
                            }}
                            onBlur={onBlur}
                        >
                            <span
                                className={`${props.classNamePrefix}__icon ${props.classNamePrefix}__icon--clear`}
                            ></span>
                        </button>
                    )}
                    <button
                        type="button"
                        className={`${props.classNamePrefix}__btn`}
                        onClick={() => setDropDownOn(false)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                //e.stopPropagation();
                                setDropDownOn(false);
                            }
                        }}
                        onBlur={onBlur}
                    >
                        <span
                            className={`${props.classNamePrefix}__icon ${props.classNamePrefix}__icon--x`}
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
            className={`${props.classNamePrefix} ${props.className}`}
        >
            {dropDownOn ? (
                <>
                    {props.withSearch ? selectSearch() : selectButton()}
                    <div className={`${props.classNamePrefix}__menu`}>
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
