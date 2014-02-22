/***

MochiKit.Iter 1.4

See <http://mochikit.com/> for documentation, downloads, license, etc.

(c) 2005 Bob Ippolito.  All rights Reserved.

***/

MochiKit.Base._deps('Iter', ['Base']);

MochiKit.Iter.NAME = "MochiKit.Iter";
MochiKit.Iter.VERSION = "1.4";
MochiKit.Base.update(MochiKit.Iter, {
    __repr__: function () {
        return "[" + this.NAME + " " + this.VERSION + "]";
    },
    toString: function () {
        return this.__repr__();
    },

    /** @id MochiKit.Iter.registerIteratorFactory  */
    registerIteratorFactory: function (name, check, iterfactory, /* optional */ override) {
        MochiKit.Iter.iteratorRegistry.register(name, check, iterfactory, override);
    },

    /** @id MochiKit.Iter.iter */
    iter: function (iterable, /* optional */ sentinel) {
        var self = MochiKit.Iter;
        if (arguments.length == 2) {
            return self.takewhile(
                function (a) { return a != sentinel; },
                iterable
            );
        }
        if (typeof(iterable.next) == 'function') {
            return iterable;
        } else if (typeof(iterable.iter) == 'function') {
            return iterable.iter();
        /*
        }  else if (typeof(iterable.__iterator__) == 'function') {
            //
            // XXX: We can't support JavaScript 1.7 __iterator__ directly
            //      because of Object.prototype.__iterator__
            //
            return iterable.__iterator__();
        */
        }

        try {
            return self.iteratorRegistry.match(iterable);
        } catch (e) {
            var m = MochiKit.Base;
            if (e == m.NotFound) {
                e = new TypeError(typeof(iterable) + ": " + m.repr(iterable) + " is not iterable");
            }
            throw e;
        }
    },

    /** @id MochiKit.Iter.count */
    count: function (n) {
        if (!n) {
            n = 0;
        }
        var m = MochiKit.Base;
        return {
            repr: function () { return "count(" + n + ")"; },
            toString: m.forwardCall("repr"),
            next: m.counter(n)
        };
    },

    /** @id MochiKit.Iter.cycle */
    cycle: function (p) {
        var self = MochiKit.Iter;
        var m = MochiKit.Base;
        var lst = [];
        var iterator = self.iter(p);
        return {
            repr: function () { return "cycle(...)"; },
            toString: m.forwardCall("repr"),
            next: function () {
                try {
                    var rval = iterator.next();
                    lst.push(rval);
                    return rval;
                } catch (e) {
                    if (e != self.StopIteration) {
                        throw e;
                    }
                    if (lst.length === 0) {
                        this.next = function () {
                            throw self.StopIteration;
                        };
                    } else {
                        var i = -1;
                        this.next = function () {
                            i = (i + 1) % lst.length;
                            return lst[i];
                        };
                    }
                    return this.next();
                }
            }
        };
    },

    /** @id MochiKit.Iter.repeat */
    repeat: function (elem, /* optional */n) {
        var m = MochiKit.Base;
        if (typeof(n) == 'undefined') {
            return {
                repr: function () {
                    return "repeat(" + m.repr(elem) + ")";
                },
                toString: m.forwardCall("repr"),
                next: function () {
                    return elem;
                }
            };
        }
        return {
            repr: function () {
                return "repeat(" + m.repr(elem) + ", " + n + ")";
            },
            toString: m.forwardCall("repr"),
            next: function () {
                if (n <= 0) {
                    throw MochiKit.Iter.StopIteration;
                }
                n -= 1;
                return elem;
            }
        };
    },

    /** @id MochiKit.Iter.next */
    next: function (iterator) {
        return iterator.next();
    },

    /** @id MochiKit.Iter.izip */
    izip: function (p, q/*, ...*/) {
        var m = MochiKit.Base;
        var self = MochiKit.Iter;
        var next = self.next;
        var iterables = m.map(self.iter, arguments);
        return {
            repr: function () { return "izip(...)"; },
            toString: m.forwardCall("repr"),
            next: function () { return m.map(next, iterables); }
        };
    },

    /** @id MochiKit.Iter.ifilter */
    ifilter: function (pred, seq) {
        var m = MochiKit.Base;
        seq = MochiKit.Iter.iter(seq);
        if (pred === null) {
            pred = m.operator.truth;
        }
        return {
            repr: function () { return "ifilter(...)"; },
            toString: m.forwardCall("repr"),
            next: function () {
                while (true) {
                    var rval = seq.next();
                    if (pred(rval)) {
                        return rval;
                    }
                }
                // mozilla warnings aren't too bright
                return undefined;
            }
        };
    },

    /** @id MochiKit.Iter.ifilterfalse */
    ifilterfalse: function (pred, seq) {
        var m = MochiKit.Base;
        seq = MochiKit.Iter.iter(seq);
        if (pred === null) {
            pred = m.operator.truth;
        }
        return {
            repr: function () { return "ifilterfalse(...)"; },
            toString: m.forwardCall("repr"),
            next: function () {
                while (true) {
                    var rval = seq.next();
                    if (!pred(rval)) {
                        return rval;
                    }
                }
                // mozilla warnings aren't too bright
                return undefined;
            }
        };
    },

    /** @id MochiKit.Iter.islice */
    islice: function (seq/*, [start,] stop[, step] */) {
        var self = MochiKit.Iter;
        var m = MochiKit.Base;
        seq = self.iter(seq);
        var start = 0;
        var stop = 0;
        var step = 1;
        var i = -1;
        if (arguments.length == 2) {
            stop = arguments[1];
        } else if (arguments.length == 3) {
            start = arguments[1];
            stop = arguments[2];
        } else {
            start = arguments[1];
            stop = arguments[2];
            step = arguments[3];
        }
        return {
            repr: function () {
                return "islice(" + ["...", start, stop, step].join(", ") + ")";
            },
            toString: m.forwardCall("repr"),
            next: function () {
                var rval;
                while (i < start) {
                    rval = seq.next();
                    i++;
                }
                if (start >= stop) {
                    throw self.StopIteration;
                }
                start += step;
                return rval;
            }
        };
    },

    /** @id MochiKit.Iter.imap */
    imap: function (fun, p, q/*, ...*/) {
        var m = MochiKit.Base;
        var self = MochiKit.Iter;
        var iterables = m.map(self.iter, m.extend(null, arguments, 1));
        var map = m.map;
        var next = self.next;
        return {
            repr: function () { return "imap(...)"; },
            toString: m.forwardCall("repr"),
            next: function () {
                return fun.apply(this, map(next, iterables));
            }
        };
    },

    /** @id MochiKit.Iter.applymap */
    applymap: function (fun, seq, self) {
        seq = MochiKit.Iter.iter(seq);
        var m = MochiKit.Base;
        return {
            repr: function () { return "applymap(...)"; },
            toString: m.forwardCall("repr"),
            next: function () {
                return fun.apply(self, seq.next());
            }
        };
    },

    /** @id MochiKit.Iter.chain */
    chain: function (p, q/*, ...*/) {
        // dumb fast path
        var self = MochiKit.Iter;
        var m = MochiKit.Base;
        if (arguments.length == 1) {
            return self.iter(arguments[0]);
        }
        var argiter = m.map(self.iter, arguments);
        return {
            repr: function () { return "chain(...)"; },
            toString: m.forwardCall("repr"),
            next: function () {
                while (argiter.length > 1) {
                    try {
                        var result = argiter[0].next();
                        return result;
                    } catch (e) {
                        if (e != self.StopIteration) {
                            throw e;
                        }
                        argiter.shift();
                        var result = argiter[0].next();
                        return result;
                    }
                }
                if (argiter.length == 1) {
                    // optimize last element
                    var arg = argiter.shift();
                    this.next = m.bind("next", arg);
                    return this.next();
                }
                throw self.StopIteration;
            }
        };
    },

    /** @id MochiKit.Iter.takewhile */
    takewhile: function (pred, seq) {
        var self = MochiKit.Iter;
        seq = self.iter(seq);
        return {
            repr: function () { return "takewhile(...)"; },
            toString: MochiKit.Base.forwardCall("repr"),
            next: function () {
                var rval = seq.next();
                if (!pred(rval)) {
                    this.next = function () {
                        throw self.StopIteration;
                    };
                    this.next();
                }
                return rval;
            }
        };
    },

    /** @id MochiKit.Iter.dropwhile */
    dropwhile: function (pred, seq) {
        seq = MochiKit.Iter.iter(seq);
        var m = MochiKit.Base;
        var bind = m.bind;
        return {
            "repr": function () { return "dropwhile(...)"; },
            "toString": m.forwardCall("repr"),
            "next": function () {
                while (true) {
                    var rval = seq.next();
                    if (!pred(rval)) {
                        break;
                    }
                }
                this.next = bind("next", seq);
                return rval;
            }
        };
    },

    _tee: function (ident, sync, iterable) {
        sync.pos[ident] = -1;
        var m = MochiKit.Base;
        var listMin = m.listMin;
        return {
            repr: function () { return "tee(" + ident + ", ...)"; },
            toString: m.forwardCall("repr"),
            next: function () {
                var rval;
                var i = sync.pos[ident];

                if (i == sync.max) {
                    rval = iterable.next();
                    sync.deque.push(rval);
                    sync.max += 1;
                    sync.pos[ident] += 1;
                } else {
                    rval = sync.deque[i - sync.min];
                    sync.pos[ident] += 1;
                    if (i == sync.min && listMin(sync.pos) != sync.min) {
                        sync.min += 1;
                        sync.deque.shift();
                    }
                }
                return rval;
            }
        };
    },

    /** @id MochiKit.Iter.tee */
    tee: function (iterable, n/* = 2 */) {
        var rval = [];
        var sync = {
            "pos": [],
            "deque": [],
            "max": -1,
            "min": -1
        };
        if (arguments.length == 1 || typeof(n) == "undefined" || n === null) {
            n = 2;
        }
        var self = MochiKit.Iter;
        iterable = self.iter(iterable);
        var _tee = self._tee;
        for (var i = 0; i < n; i++) {
            rval.push(_tee(i, sync, iterable));
        }
        return rval;
    },

    /** @id MochiKit.Iter.list */
    list: function (iterable) {
        // Fast-path for Array and Array-like
        var rval;
        if (iterable instanceof Array) {
            return iterable.slice();
        } 
        // this is necessary to avoid a Safari crash
        if (typeof(iterable) == "function" &&
                !(iterable instanceof Function) &&
                typeof(iterable.length) == 'number') {
            rval = [];
            for (var i = 0; i < iterable.length; i++) {
                rval.push(iterable[i]);
            }
            return rval;
        }

        var self = MochiKit.Iter;
        iterable = self.iter(iterable);
        var rval = [];
        var a_val;
        try {
            while (true) {
                a_val = iterable.next();
                rval.push(a_val);
            }
        } catch (e) {
            if (e != self.StopIteration) {
                throw e;
            }
            return rval;
        }
        // mozilla warnings aren't too bright
        return undefined;
    },


    /** @id MochiKit.Iter.reduce */
    reduce: function (fn, iterable, /* optional */initial) {
        var i = 0;
        var x = initial;
        var self = MochiKit.Iter;
        iterable = self.iter(iterable);
        if (arguments.length < 3) {
            try {
                x = iterable.next();
            } catch (e) {
                if (e == self.StopIteration) {
                    e = new TypeError("reduce() of empty sequence with no initial value");
                }
                throw e;
            }
            i++;
        }
        try {
            while (true) {
                x = fn(x, iterable.next());
            }
        } catch (e) {
            if (e != self.StopIteration) {
                throw e;
            }
        }
        return x;
    },

    /** @id MochiKit.Iter.range */
    range: function (/* [start,] stop[, step] */) {
        var start = 0;
        var stop = 0;
        var step = 1;
        if (arguments.length == 1) {
            stop = arguments[0];
        } else if (arguments.length == 2) {
            start = arguments[0];
            stop = arguments[1];
        } else if (arguments.length == 3) {
            start = arguments[0];
            stop = arguments[1];
            step = arguments[2];
        } else {
            throw new TypeError("range() takes 1, 2, or 3 arguments!");
        }
        if (step === 0) {
            throw new TypeError("range() step must not be 0");
        }
        return {
            next: function () {
                if ((step > 0 && start >= stop) || (step < 0 && start <= stop)) {
                    throw MochiKit.Iter.StopIteration;
                }
                var rval = start;
                start += step;
                return rval;
            },
            repr: function () {
                return "range(" + [start, stop, step].join(", ") + ")";
            },
            toString: MochiKit.Base.forwardCall("repr")
        };
    },

    /** @id MochiKit.Iter.sum */
    sum: function (iterable, start/* = 0 */) {
        if (typeof(start) == "undefined" || start === null) {
            start = 0;
        }
        var x = start;
        var self = MochiKit.Iter;
        iterable = self.iter(iterable);
        try {
            while (true) {
                x += iterable.next();
            }
        } catch (e) {
            if (e != self.StopIteration) {
                throw e;
            }
        }
        return x;
    },

    /** @id MochiKit.Iter.exhaust */
    exhaust: function (iterable) {
        var self = MochiKit.Iter;
        iterable = self.iter(iterable);
        try {
            while (true) {
                iterable.next();
            }
        } catch (e) {
            if (e != self.StopIteration) {
                throw e;
            }
        }
    },

    /** @id MochiKit.Iter.forEach */
    forEach: function (iterable, func, /* optional */self) {
        var m = MochiKit.Base;
        if (arguments.length > 2) {
            func = m.bind(func, self);
        }
        // fast path for array
        if (m.isArrayLike(iterable)) {
            try {
                for (var i = 0; i < iterable.length; i++) {
                    func(iterable[i]);
                }
            } catch (e) {
                if (e != MochiKit.Iter.StopIteration) {
                    throw e;
                }
            }
        } else {
            self = MochiKit.Iter;
            self.exhaust(self.imap(func, iterable));
        }
    },

    /** @id MochiKit.Iter.every */
    every: function (iterable, func) {
        var self = MochiKit.Iter;
        try {
            self.ifilterfalse(func, iterable).next();
            return false;
        } catch (e) {
            if (e != self.StopIteration) {
                throw e;
            }
            return true;
        }
    },

    /** @id MochiKit.Iter.sorted */
    sorted: function (iterable, /* optional */cmp) {
        var rval = MochiKit.Iter.list(iterable);
        if (arguments.length == 1) {
            cmp = MochiKit.Base.compare;
        }
        rval.sort(cmp);
        return rval;
    },

    /** @id MochiKit.Iter.reversed */
    reversed: function (iterable) {
        var rval = MochiKit.Iter.list(iterable);
        rval.reverse();
        return rval;
    },

    /** @id MochiKit.Iter.some */
    some: function (iterable, func) {
        var self = MochiKit.Iter;
        try {
            self.ifilter(func, iterable).next();
            return true;
        } catch (e) {
            if (e != self.StopIteration) {
                throw e;
            }
            return false;
        }
    },

    /** @id MochiKit.Iter.iextend */
    iextend: function (lst, iterable) {
        if (MochiKit.Base.isArrayLike(iterable)) {
            // fast-path for array-like
            for (var i = 0; i < iterable.length; i++) {
                lst.push(iterable[i]);
            }
        } else {
            var self = MochiKit.Iter;
            iterable = self.iter(iterable);
            try {
                while (true) {
                    lst.push(iterable.next());
                }
            } catch (e) {
                if (e != self.StopIteration) {
                    throw e;
                }
            }
        }
        return lst;
    },

    /** @id MochiKit.Iter.groupby */
    groupby: function(iterable, /* optional */ keyfunc) {
        var m = MochiKit.Base;
        var self = MochiKit.Iter;
        if (arguments.length < 2) {
            keyfunc = m.operator.identity;
        }
        iterable = self.iter(iterable);

        // shared
        var pk = undefined;
        var k = undefined;
        var v;

        function fetch() {
            v = iterable.next();
            k = keyfunc(v);
        };

        function eat() {
            var ret = v;
            v = undefined;
            return ret;
        };

        var first = true;
        var compare = m.compare;
        return {
            repr: function () { return "groupby(...)"; },
            next: function() {
                // iterator-next

                // iterate until meet next group
                while (compare(k, pk) === 0) {
                    fetch();
                    if (first) {
                        first = false;
                        break;
                    }
                }
                pk = k;
                return [k, {
                    next: function() {
                        // subiterator-next
                        if (v == undefined) { // Is there something to eat?
                            fetch();
                        }
                        if (compare(k, pk) !== 0) {
                            throw self.StopIteration;
                        }
                        return eat();
                    }
                }];
            }
        };
    },

    /** @id MochiKit.Iter.groupby_as_array */
    groupby_as_array: function (iterable, /* optional */ keyfunc) {
        var m = MochiKit.Base;
        var self = MochiKit.Iter;
        if (arguments.length < 2) {
            keyfunc = m.operator.identity;
        }

        iterable = self.iter(iterable);
        var result = [];
        var first = true;
        var prev_key;
        var compare = m.compare;
        while (true) {
          RIFF2   WAVEfmt      "V  "V      fact       data    ÿû8Ä                 Info      `  QØ 
 "%(*-0258:=@@BEHJMPRUXZ]`behjmpruxz}€€‚…ˆŠ’•˜š ¢¥¨ª­°²µ¸º½ÀÀÂÅÈÊÍĞÒÕØÚİàâåèêíğòõøúıÿ   :LAME3.93 m        0$uA     QØé&˜                                       ÿû8Ä  
¥™
Õ nœ$—0ğFÂ)âPÂöSğ@$üÀÿñ¸üEÿüE‘ ¨"ÿğ…:“˜ÂÿÿÄ8ˆB4œ€“ÿÿÿ'İ[ $a€„/ÿÿÿÿ©âÚæ0°<$“‚ B ˜Ú¹yqóç/0ÇB«2\4ĞÃìù[/Üa¾BÁ¤a(ÆîV¸d+ê¶=Û%ûÅ‡åHüªq=`«ĞiÌĞ"Z§–eÏ9Ç#ÊErvï`;3¿ûŸÿ°×íV‘ á¨<F¤ ğl#‰DPÿû8Ä	 ÙM(F$jÁ™$§!¼•(É—¹.³¿{t…’^î$Ğã3cWÜÏŒV‡)_cé•ïXç¾r‹¹÷;ÉË¯èy»úœ­~ˆ¢ÈÈÒ¹DEœó5*FBÁóh9[‚J¬Ã‚³ º(‰”˜™1éoÁY¼¦9A¨6›a¼î:Õ©t&[5ŒqÄ‘ÜvÈr”œôooëÿÿêèB)ä)ÎèB8qœî¯“íÿÿô#©Üˆ@ î¦r
ù”q7_é<†õ¹L2à–Ä™‰ä(Bÿû8Ä-!H­Áv¤é”,œ¸¯8Îôd
§ù£¢Ø¤¿¿óØcZz/–´S¿÷üŒ¿_óº*S¸¡‹sd

çÇNïsÓşïW]"Tñÿÿİ»ÂLè
Ï³íıs58û08JóÇS£ĞÉ`ÈcïÆ4;æâq¹ÏcT,É¿”2‚Íß#Ì³^¥é´Ä™¹¨ÿ½:9ç)—UuAº¶»ÿõVù¬ƒäËãÃÀôc‚)ß§
‡	ˆÁa'êŠ   ï]NÀ'Û·jÿ³ÿû8Ä
A_ãaE	x1¬½‡ˆù–åH`),…j óLè/ qì½	&:eM9é¯½ıÏúúşÇsèxÕı‚¡	ŠÜ­ÿoªŸûr¥
?ºÿ”7îTº/0©Å:£!â£@¸  ã#á®,·˜r½0âMecFoˆ vGoÑæ°\z	 UÒ1ÿ§¥ùİ§“ÿôtníS¸Eÿş]´‰?©ÿTçs£6{‰ÿÿû¢
d©Ô†©ßì ÁÄÀnëãÔMÒ
EAÒı³Ã‘„îs¦ÿû8Ä4“\¬¬v{­<ü>@+D!ü&•¸ÍHR)$$!aY0C^ãaPPA€3f™QĞL@0û‹”ÏÆ”ús2q#ì@é¿øPÑFŞ MN(ã……	¶@>ô~Ÿø±âQü8  p®šãGÿ™‹ÎhI*k£vÒ5ùšëN Gº!A “V7nQ|$xô²ë9ãâ×eaf«a …"ÆAg[r!œçÿóOMk"4låİÈ=ÿ$³]ªÙ€   Š€vXvë,÷$Zÿû8Ä “e¥åŒÁ7­<,1ôš8ÛÏÿÈgµ‚ùŠg5kÈÉ‰* _ÚA_	yDà¤Dq£Ã?ˆøšpºüÜ¬ŞËÖvta¿ÛãĞòZ1=Lwë¥   	h…E.‡ô„rçlSØù´euı:„öX7ÔØUİbúüÈbä)¢¥KAü¼ë}º“çi´æ_`µUlÑ(êïm¨q´&ÿüpî´¢³“ëM=·üó¬³5fq›ÙUŒ0PJ"1=ßV ™ˆÌ<§UêJÿû8ÄÊàÁ\°x<•ë€¼¡9Øİæ¶ò]¦˜xD
Üw’©«¹õ 0Qÿ­r°©Âå§éä=û?êútL`qÔ°K)• ~à¯ˆÖ³u`ÃK¤ L¹°H.|¡^1Æ WhêÑ‹\r­\¦vÙÂ }w®{÷ÿæ\é²æmÄmÆÎáç9^Ué    	“qKZ/Q¤¨	úa™Í<3p‡ÅÙ^•åĞ¨GHÆw–ÄK‹õ<[y÷€§ÿoê•îC*÷Bÿ-ğàØ\ÀO@ÿû8Ä%
ğÓi¥<MAH–,İ8”w¢†ê/Jr%¡„ ÖaäÊ¤ı;D0•‰²Ï@Ô}%É±6¯®oi€H¬RæèßNÓq`éuX>]«
`ãK  ˜›Qİ¿õ;|}ét\'pµ’JÙÎt³Bõ¨è&“2†H´1ƒŠµPg.¦³¬Ùd4ïô¶äÚd6‰FØtŸDv‡©ú³kJS*”IÅáÛ]?ÿS€ª¢€ÄÏ!Fr
!Õ¨kô‰L `ÖÓ$t)ä0œÆÿû8Ä1ŠH¿ZhKAk¤ÜpXıÇ¨­Êq¡}¬ás·©Å­bMõŒ-·%ûÊfõ-
~ÃÃ™LŸÿşT]YLıÇ‘ı?mk=ÿÿ:êİ"<Ã–#Y	“!Ìu-fMíá“K~õt6OÑq,0âÙ;R
%3–J:KiÒhÁVºEº·Ş?ÇÿÉb:  ’ìçqÂ²ág¿u$¨ |Î¡G­€h>ï6|äßüûBÏÆp01bcY‹"<Ñ1–i¨\,§Ïo±qNÃ%%ÿû8ÄA‰¨¿N	<KÁ™°ª$õ.z4ˆCÚHIßæı?˜ÕåNFN¯ûÿûşıì9Hé2Ğl*H“”ÎPz®¼ëÒ—Ç¾ND•Ü     
pËH¿L°pà0Sæ ê=Û=ùÚ¦^8ÙıFoò²7ç™¿w"0Ë>"õ?Ğ_ûşvöŠ¿U¿ÿÿ*«tg<‡UÖî¾=ÆªÉˆØ œ2HœÑ [L#¤µûÔkùÑ×]cÔıíXöüë¨”{SbğÙÃ®§+z ¿şoÕ»+¿ÿû8ÄIŠwU¨´­ÉH.j´Ó—{OşßÈŒEÖRnv­’Qˆ#Š      Ş3K©¾!€ò«½õúìX§ş§ú$º:Zd³úØ£ù7ÿùo®]ãõ®`PÊmğú~…ô ·Èo¢·ÿÿ`1ÈE¢ÂßøÃi'ô<ÌåÀ   ½¸˜ ;ŞÀl>¶ÜŠoAÄ1]Ø†ş¥mê:ßÿõ;Ì`%§G;jsŒo@¿¢ıLßv×#ÑpG§FúÛæg¬JeV1n•Ue)èBs*Ô     ›ñÿû8ÄW
)U[ç´OÉT®,<Ó‰¸K•ÁçÖ ™€ÿ)°šçôúHİfó@ãò¤¬Ü‰ß0ïşŠNÜ°x92èÃ`,cùŸ÷ûz¡Ÿÿ£d©Í%Pÿÿşù™Ë©U8l¯óà(    u0O)nå¶5)“¢`­Qµ(Ú]Aœå^F„›;%Ï„ãF^(Aó™jPÏ°‹ğ›ÍŠb=A í~¶ª€áTÍŠ³ş¿ÿë‰Ô‚ayÉ€eOô @  ³a*ÖµVÃĞbF˜À¤ L æsÛ°‚X‘AFQÿû8Äe€Š•o]¦SIMë¼óP+Ü¼¸8(ÑÒ„ÉÁ$x¤Ç•äŞÆíÑ?Èç)–KîĞUhÎ+­Övåˆ"<2ÇõÎSD‹[m‚\şÊ_Ò%ÎZ¥¹=E®¸B—øŸÿäGô;÷…öMRZ„‘C‹®$tpñ‚ ™†¦Üû˜ÔìºÖÂÙŸP‘LPqèÂ$a»Qvrš¢˜°S¡‘¢4¾aå¿U?Á6'zT û>¦‰weN$Œ±ºJ'UÃ€¢CE§ªuÕØĞaÊüßÿû8Äs‹Y­<š•+D¼¸2¨Ö
4“ôZö,ğo!S×‰hÖõ«öºÎ»{6ŞAØŞqßô¨$¦è‹@O<*„ÆU0  ÿÔ§ºl-3´ÏÜ"ÜáÌ½‹¨P½7‘ŒÍVTÖ)Ğ2†M†İnbÙ[jXØ½u¬¤Å¹˜2‹¯ë¸å˜.ûŠ*ä‹Øìc÷Òäoÿúí·_êBç9vÌŒm·•ÖnØ(ÕÓÈôÊ` n	ªË$/üäa;bò