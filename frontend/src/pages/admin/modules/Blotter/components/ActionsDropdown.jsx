import React, { Fragment, useRef, useEffect, useState } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { createPortal } from 'react-dom';
import {
  EllipsisVerticalIcon,
  EyeIcon,
  PencilSquareIcon,
  CheckCircleIcon,
  UserMinusIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

const ActionsDropdown = ({ record, onViewDetails, onEditCase, onMarkSolved, onMarkNoShow }) => {
  const buttonRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [shouldFlipUp, setShouldFlipUp] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Calculate dropdown position when opened
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const updatePosition = () => {
        const buttonRect = buttonRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const dropdownHeight = 320; // Approximate dropdown height
        
        // Check if dropdown would overflow bottom of viewport
        const wouldOverflow = buttonRect.bottom + dropdownHeight > viewportHeight;
        setShouldFlipUp(wouldOverflow);

        // Calculate position
        setDropdownPosition({
          top: wouldOverflow ? buttonRect.top - dropdownHeight : buttonRect.bottom + 4,
          left: buttonRect.right - 224, // 224px = w-56 (14rem)
        });
      };

      updatePosition();

      // Update position on scroll or resize
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);

      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isOpen]);

  const DropdownContent = ({ children }) => {
    if (!isOpen) return null;

    return createPortal(
      <div
        style={{
          position: 'fixed',
          top: `${dropdownPosition.top}px`,
          left: `${dropdownPosition.left}px`,
          zIndex: 9999,
        }}
      >
        {children}
      </div>,
      document.body
    );
  };

  const menuItems = [
    {
      label: 'View Details',
      icon: EyeIcon,
      onClick: () => onViewDetails?.(record),
      className: 'text-gray-700 hover:bg-blue-50 hover:text-blue-700',
    },
    {
      label: 'Edit Case',
      icon: PencilSquareIcon,
      onClick: () => onEditCase?.(record),
      className: 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-700',
    },
    {
      label: 'Mark as Solved',
      icon: CheckCircleIcon,
      onClick: () => onMarkSolved?.(record),
      className: 'text-gray-700 hover:bg-green-50 hover:text-green-700',
    },
    {
      divider: true,
    },
    {
      label: 'Mark Complainant No-Show',
      icon: UserMinusIcon,
      onClick: () => onMarkNoShow?.(record, 'complainant'),
      className: 'text-red-600 hover:bg-red-50 hover:text-red-700',
      destructive: true,
    },
    {
      label: 'Mark Respondent No-Show',
      icon: ExclamationTriangleIcon,
      onClick: () => onMarkNoShow?.(record, 'respondent'),
      className: 'text-red-600 hover:bg-red-50 hover:text-red-700',
      destructive: true,
    },
  ];

  return (
    <Menu as="div" className="relative inline-block text-left">
      {({ open }) => {
        // Update isOpen state when menu opens/closes
        useEffect(() => {
          setIsOpen(open);
        }, [open]);

        return (
          <>
            <Menu.Button
              ref={buttonRef}
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              aria-label="More actions"
            >
              <EllipsisVerticalIcon className="w-5 h-5" />
            </Menu.Button>

            <DropdownContent>
              <Transition
                show={open}
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-150"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items
                  className={`w-56 rounded-xl bg-white shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden ${
                    shouldFlipUp ? 'origin-bottom-right' : 'origin-top-right'
                  }`}
                  static
                >
                  <div className="py-1">
                    {menuItems.map((item, index) => {
                      if (item.divider) {
                        return (
                          <div
                            key={`divider-${index}`}
                            className="my-1 border-t border-gray-200"
                          />
                        );
                      }

                      return (
                        <Menu.Item key={item.label}>
                          {({ active }) => (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                item.onClick();
                              }}
                              className={`${
                                item.className
                              } group flex items-center w-full px-4 py-2.5 text-sm font-medium transition-all duration-150 ${
                                active ? 'translate-x-1' : ''
                              }`}
                            >
                              <item.icon
                                className={`mr-3 h-5 w-5 flex-shrink-0 ${
                                  item.destructive
                                    ? 'text-red-500'
                                    : 'text-gray-400 group-hover:text-current'
                                }`}
                                aria-hidden="true"
                              />
                              <span className="flex-1 text-left">{item.label}</span>
                              {item.destructive && (
                                <ExclamationTriangleIcon className="ml-2 h-4 w-4 text-red-400" />
                              )}
                            </button>
                          )}
                        </Menu.Item>
                      );
                    })}
                  </div>
                </Menu.Items>
              </Transition>
            </DropdownContent>
          </>
        );
      }}
    </Menu>
  );
};

export default ActionsDropdown;

