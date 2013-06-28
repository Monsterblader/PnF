@echo off
rd build /s /q
mkdir build\img
mkdir build\css
mkdir build\js

copy img\* build\img

call .\node_modules\.bin\lessc -x less\bootstrap.less > build\css\bootstrap.min.css

copy /B js\bootstrap-transition.js+js\bootstrap-alert.js+js\bootstrap-button.js+js\bootstrap-carousel.js+js\bootstrap-collapse.js+js\bootstrap-dropdown.js+js\bootstrap-modal.js+js\bootstrap-tooltip.js+js\bootstrap-popover.js+js\bootstrap-scrollspy.js+js\bootstrap-tab.js+js\bootstrap-typeahead.js build\js\bootstrap.js

call .\node_modules\.bin\uglifyjs --ascii bootstrap\js\bootstrap.js > build\js\bootstrap.min.js