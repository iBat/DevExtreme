import { getWidth, getHeight, setWidth, setHeight } from '../../core/utils/size';
import $ from '../../core/renderer';
import { noop } from '../../core/utils/common';
import { getPublicElement } from '../../core/element';
import animationPosition from '../../animation/position';
import { extend } from '../../core/utils/extend';
import ContextMenu from '../context_menu';

const DX_CONTEXT_MENU_CONTENT_DELIMITER_CLASS = 'dx-context-menu-content-delimiter';
const DX_SUBMENU_CLASS = 'dx-submenu';

class Submenu extends ContextMenu {
    _getDefaultOptions() {
        return extend(super._getDefaultOptions(), {
            orientation: 'horizontal',
            tabIndex: null,
            onHoverStart: noop
        });
    }

    _initDataAdapter() {
        this._dataAdapter = this.option('_dataAdapter');
        if(!this._dataAdapter) {
            super._initDataAdapter();
        }
    }

    _renderContentImpl() {
        this._renderContextMenuOverlay();
        super._renderContentImpl();

        const node = this._dataAdapter.getNodeByKey(this.option('_parentKey'));
        node && this._renderItems(this._getChildNodes(node));

        if(node?.height) {
            this._overlay.$content().find(`.${DX_SUBMENU_CLASS}`).css('height', node.height);
        }

        this._renderDelimiter();
    }

    // _renderItems(nodes, submenuContainer) {
    //     const $nodeContainer = super._renderItems(nodes, submenuContainer);
    //
    //     if($nodeContainer) {
    //         const el = $nodeContainer.closest(`.${DX_SUBMENU_CLASS}`);
    //         const parentElement = el.closest('.dx-menu-item-has-submenu');
    //
    //         if(parentElement) {
    //             el.css('position', 'fixed');
    //             // TODO height calc
    //             el.css('height', 250);
    //             el.dxScrollView({});
    //             // console.log('submenu', parentElement, this.$element());
    //         }
    //     }
    // }

    _renderDelimiter() {
        this.$contentDelimiter = $('<div>')
            .appendTo(this._itemContainer())
            .addClass(DX_CONTEXT_MENU_CONTENT_DELIMITER_CLASS);
    }

    _getOverlayOptions() {
        return extend(true, super._getOverlayOptions(), {
            onPositioned: this._overlayPositionedActionHandler.bind(this),
            position: {
                precise: true,
            }
        });
    }

    _overlayPositionedActionHandler(arg) {
        this._showDelimiter(arg);
    }

    _hoverEndHandler(e) {
        super._hoverEndHandler(e);
        this._toggleFocusClass(false, e.currentTarget);
    }

    _isMenuHorizontal() {
        return this.option('orientation') === 'horizontal';
    }

    _hoverStartHandler(e) {
        const hoverStartAction = this.option('onHoverStart');
        hoverStartAction(e);

        super._hoverStartHandler(e);
        this._toggleFocusClass(true, e.currentTarget);
    }

    _drawSubmenu($rootItem) {
        this._actions.onShowing({
            rootItem: getPublicElement($rootItem),
            submenu: this
        });
        super._drawSubmenu($rootItem);
        this._actions.onShown({
            rootItem: getPublicElement($rootItem),
            submenu: this
        });
    }

    _hideSubmenu($rootItem) {
        this._actions.onHiding({
            cancel: true,
            rootItem: getPublicElement($rootItem),
            submenu: this
        });
        super._hideSubmenu($rootItem);
        this._actions.onHidden({
            rootItem: getPublicElement($rootItem),
            submenu: this
        });
    }

    // TODO: try to simplify it
    _showDelimiter(arg) {
        if(!this.$contentDelimiter) {
            return;
        }

        const $submenu = this._itemContainer().children(`.${DX_SUBMENU_CLASS}`).eq(0);
        const $rootItem = this.option('position').of.find('.dx-context-menu-container-border');
        const position = {
            of: $submenu,
            precise: true,
        };
        const containerOffset = arg.position;
        const vLocation = containerOffset.v.location;
        const hLocation = containerOffset.h.location;
        const rootOffset = $rootItem.offset();
        const offsetLeft = Math.round(rootOffset.left);
        const offsetTop = Math.round(rootOffset.top);
        const rootWidth = getWidth($rootItem);
        const rootHeight = getHeight($rootItem);
        const submenuWidth = getWidth($submenu);
        const submenuHeight = getHeight($submenu);

        this.$contentDelimiter.css('display', 'block');
        setWidth(
            this.$contentDelimiter,
            this._isMenuHorizontal() ? (rootWidth < submenuWidth ? rootWidth : submenuWidth) : 3
        );
        setHeight(
            this.$contentDelimiter,
            this._isMenuHorizontal() ? 3 : (rootHeight < submenuHeight ? rootHeight : submenuHeight)
        );

        if(this._isMenuHorizontal()) {
            if(vLocation > offsetTop) {
                if(Math.round(hLocation) === offsetLeft) {
                    position.offset = '0 -2.5';
                    position.at = position.my = 'left top';
                } else {
                    position.offset = '0 -2.5';
                    position.at = position.my = 'right top';
                }
            } else {
                setHeight(this.$contentDelimiter, 5);
                if(Math.round(hLocation) === offsetLeft) {
                    position.offset = '0 5';
                    position.at = position.my = 'left bottom';
                } else {
                    position.offset = '0 5';
                    position.at = position.my = 'right bottom';
                }
            }
        } else {
            if(hLocation > offsetLeft) {
                if(Math.round(vLocation) === offsetTop) {
                    position.offset = '-2.5 0';
                    position.at = position.my = 'left top';
                } else {
                    position.offset = '-2.5 0';
                    position.at = position.my = 'left bottom';
                }
            } else {
                if(Math.round(vLocation) === offsetTop) {
                    position.offset = '2.5 0';
                    position.at = position.my = 'right top';
                } else {
                    position.offset = '2.5 0';
                    position.at = position.my = 'right bottom';
                }
            }
        }
        animationPosition.setup(this.$contentDelimiter, position);
    }

    _getContextMenuPosition() {
        return this.option('position');
    }

    isOverlayVisible() {
        return this._overlay.option('visible');
    }

    getOverlayContent() {
        return this._overlay.$content();
    }
}

export default Submenu;
