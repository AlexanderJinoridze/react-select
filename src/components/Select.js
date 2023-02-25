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
    const [dropDownOn, setDropDownOn] = useState(false);
    const [search, setSearch] = useState("");
    const [options, setOptions] = useState(initialOptions);
    const [selected, setSelected] = useState(value);
    const [selectedItems, setSelectedItems] = useState("");
    const [highlightedOption, setHighlightedOption] = useState("");

    const selectRef = useRef(null);
    const selectButtonRef = useRef(null);
    const uniqueID = useMemo(() => uuid(), []);

    const handleClick = (value) => {
        setDropDownOn(false);
        setSelected(value);
    };

    const handleChange = (value) => {
        selectButtonRef.current.focus();

        if (withCheck === "single") {
            setSelected(selected === value ? "" : value);
        } else if (withCheck === "multiple") {
            const newSelected = [...selected];
            if (newSelected.includes(value)) {
                newSelected.splice(newSelected.indexOf(value), 1);
            } else {
                newSelected.push(value);
            }
            setSelected(newSelected);
        }
    };

    const onBlur = (event) => {
        if (
            event.relatedTarget &&
            !selectRef.current.contains(event.relatedTarget)
        ) {
            setDropDownOn(false);
        }
    };

    const onKeyDown = (event) => {
        if (event.key === "Enter") {
            if (withCheck) {
                handleChange(highlightedOption);
            } else {
                handleClick(highlightedOption);
            }
        }

        if (event.key === "ArrowUp" || event.key === "ArrowDown") {
            event.preventDefault();
            let index;
            let value;
            let currentIndex = Object.keys(options).indexOf(highlightedOption);
            let lastIndex = Object.keys(options).length - 1;

            if (event.key === "ArrowUp") {
                index = currentIndex - 1;
            } else if (event.key === "ArrowDown") {
                index = currentIndex + 1;
            }

            if (index < 0) {
                index = lastIndex;
            } else if (index > lastIndex) {
                index = 0;
            }

            value = Object.keys(options)[index];

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
            setHighlightedOption(value);
        }
    };

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
        onChange(selected);
    }, [selected]);

    useEffect(() => {
        let searchResults = {};

        for (const [value, label] of Object.entries(initialOptions)) {
            if (label.toLowerCase().includes(search.toLowerCase())) {
                searchResults[value] = label;
            }
        }

        setHighlightedOption(Object.keys(searchResults)[0]);
        setOptions(searchResults);
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
                            type="checkbox"
                            tabIndex={-1}
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
                        onClick={() => handleClick(value)}
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
                ref={selectButtonRef}
                tabIndex={0}
                className={`${classNamePrefix}__button`}
                onClick={() => setDropDownOn(!dropDownOn)}
                onKeyDown={(event) => {
                    if (dropDownOn) {
                        onKeyDown(event);
                    } else {
                        event.key === "Enter" && setDropDownOn(!dropDownOn);
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
                    ref={selectButtonRef}
                    type="text"
                    className={`${classNamePrefix}__search`}
                    autoFocus
                    value={search}
                    placeholder="Search..."
                    onChange={(event) => setSearch(event.target.value)}
                    onKeyDown={(event) => onKeyDown(event)}
                    onFocus={() => setDropDownOn(true)}
                    onBlur={onBlur}
                />
                <div className={`${classNamePrefix}__arrow`}>
                    <button
                        className={`${classNamePrefix}__btn`}
                        onClick={() => setSelected([])}
                        onKeyDown={(event) =>
                            event.key === "Enter" && setSelected([])
                        }
                        onBlur={onBlur}
                    >
                        <span
                            className={`${classNamePrefix}__icon ${classNamePrefix}__icon--clear`}
                        ></span>
                    </button>
                    <button
                        className={`${classNamePrefix}__btn`}
                        onClick={() => setDropDownOn(false)}
                        onKeyDown={(event) =>
                            event.key === "Enter" && setDropDownOn(false)
                        }
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
        <div ref={selectRef} className={`${classNamePrefix} ${className}`}>
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
