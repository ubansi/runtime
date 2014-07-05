// Copyright 2014 Runtime.JS project authors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// NOTE: This script executed in every context automatically

// This global function should be the only one in this script
(function(__native) {
    "use strict";

    /**
     * Helper function to support IPC function calls
     */
    function callWrapper(fn, threadPtr, argsArray, promiseid) {
        if (null === fn) {
            // Invalid function call
            __native.callResult(false, threadPtr, promiseid, null);
            return;
        }

        var ret = fn.apply(this, argsArray);

        if (ret instanceof Promise) {
            if (!ret.then) return;

            ret.then(function(result) {
                __native.callResult(true, threadPtr, promiseid, result);
            }, function(result) {
                __native.callResult(false, threadPtr, promiseid, result);
            }).catch(function(err) {
                // TODO: rethrow this error outside of promise handler
                runtime.log(err.stack);

                __native.callResult(false, threadPtr, promiseid, null);
            });

            return;
        }

        __native.callResult(true, threadPtr, promiseid, ret);
    };

    __native.installInternals({
        callWrapper: callWrapper,
    });
});
// No more code here
