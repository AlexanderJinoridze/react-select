import { useState, useEffect, useRef, useMemo } from "react";
import PropTypes from "prop-types";
import scrollIntoView from "scroll-into-view-if-needed";
import classNames from "classnames";

import { v4 as uuid } from "uuid";

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
    // const [uniqueID, setUniqueID] = useState();
    const [dropDownOn, setDropDownOn] = useState(false);
    const [search, setSearch] = useState("");
    const [options, setOptions] = useState(initialOptions);
    const [selected, setSelected] = useState(value);
    const [selectedItems, setSelectedItems] = useState("");
    const [highlightedOption, setHighlightedOption] = useState("");

    const selectRef = useRef(null);
    const uniqueID = useMemo(() => uuid(), []);

    const onClick = (value) => {
        setDropDownOn(false);
        setSelected(value);
        // onChange(value);
    };

    const handleChange = (value) => {
        if (withCheck === "single") {
            selectRef.current.querySelectorAll(".select__button")[0].focus();
            setSelected(selected === value ? "" : value);
            // onChange(selected === value ? "" : value);
        } else if (withCheck === "multiple") {
            const newSelected = [...selected];
            selectRef.current.querySelectorAll(".select__search")[0].focus();
            if (newSelected.includes(value)) {
                newSelected.splice(newSelected.indexOf(value), 1);
            } else {
                newSelected.push(value);
            }
            setSelected(newSelected);
            // onChange(newSelected);
        }
    };

    const onBlur = (e) => {
        if (e.relatedTarget && !selectRef.current.contains(e.relatedTarget)) {
            setDropDownOn(false);
        }
    };

    function onKeyDown(e) {
        // e.preventDefault();
        // e.stopPropagation();
        // console.log(this, e.target);

        // if (e.target !== this) {
        //     return;
        // }

        if (e.key === "Enter") {
            if (withCheck) {
                handleChange(highlightedOption);
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
                    `.${classNamePrefix}__menu #${value}`
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

    // useEffect(() => {
    //     setSelected(value);
    // }, [value]);

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
        onChange(selected);
    }, [selected]);

    useEffect(() => {
        setSearch("");
    }, [dropDownOn]);

    useEffect(() => {
        const getPlaceholder = () => {
            if (withCheck) {
                if (!selected.length) return placeholder;
                if (withCheck === "single") return options[selected];

                return selected
                    .map((value) => initialOptions[value])
                    .join(", ");
            } else {
                if (!selected) return placeholder;

                return options[selected];
            }
        };

        setSelectedItems(getPlaceholder());
    }, [selected]);

    useEffect(() => {
        const getSearchResults = () => {
            let searchResults = {};

            for (const [value, label] of Object.entries(initialOptions)) {
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
                <div className={`${classNamePrefix}__no-res`}>
                    <span>List is Empty</span>
                </div>
            );
        }

        return Object.keys(options).map((value, index) => {
            const label = options[value];
            const labelID = `${uniqueID}__${value}`;

            const optionContent = customOption ? (
                customOption(value, label)
            ) : (
                <div>{label}</div>
            );

            let template;

            if (withCheck) {
                template = (
                    <label
                        key={index}
                        id={value}
                        className={classNames({
                            [`${classNamePrefix}__menu-item`]: true,
                            [`${classNamePrefix}__menu-item--highlighted`]:
                                value === highlightedOption,
                            [`${classNamePrefix}__menu-item--selected`]:
                                value === selected,
                        })}
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
                        {optionContent}
                    </label>
                );
            } else {
                template = (
                    <div
                        key={index}
                        id={value}
                        className={classNames({
                            [`${classNamePrefix}__menu-item`]: true,
                            [`${classNamePrefix}__menu-item--highlighted`]:
                                value === highlightedOption,
                            [`${classNamePrefix}__menu-item--selected`]:
                                value === selected,
                        })}
                        onMouseEnter={() => setHighlightedOption(value)}
                        onClick={() => onClick(value)}
                    >
                        {optionContent}
                    </div>
                );
            }

            return template;
        });
    };

    const selectButton = () => {
        return (
            <div
                className={`${classNamePrefix}__button`}
                tabIndex="0"
                onMouseUp={() => setDropDownOn(!dropDownOn)}
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
                        if (e.key === "Enter" && !highlightedOption)
                            e.stopPropagation();
                    }}
                    onFocus={() => setDropDownOn(true)}
                    onBlur={onBlur}
                />
                <div className={`${classNamePrefix}__arrow`}>
                    {withCheck === "multiple" && (
                        <button
                            className={`${classNamePrefix}__btn`}
                            onClick={() => {
                                setSelected([]);
                                // onChange([]);
                            }}
                            onKeyDown={(e) => {
                                e.stopPropagation();
                                if (e.key === "Enter") {
                                    setSelected([]);
                                    // onChange([]);
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
                            e.stopPropagation();
                            if (e.key === "Enter") {
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
            //onKeyDown={onKeyDown}
            onKeyDown={(e) => {
                if (dropDownOn) {
                    if (e.key === "ArrowUp" || e.key === "ArrowDown")
                        e.preventDefault();

                    onKeyDown(e);
                }

                if (!(withCheck && dropDownOn)) {
                    e.key === "Enter" && setDropDownOn(!dropDownOn);
                }
            }}
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
