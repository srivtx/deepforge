import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "ca-141",
    title: "Gradient of the Determinant (Matrix Calculus)",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "For the 2x2 matrix A = [[a, b], [c, d]], the gradient of the determinant with respect to the entries is the cofactor matrix.\n\nSince det(A) = a*d - b*c, return [[d, -c], [-b, a]] as a nested list of floats.",
    starterCode: `def gradient_det(a, b, c, d):
    # Return the 2x2 gradient of det(A)
    # Your code here
    pass`,
    solution: `def gradient_det(a, b, c, d):
    return [[float(d), float(-c)], [float(-b), float(a)]]`,
    testCases: [
      { input: [1, 2, 3, 4], expected: [[4.0, -3.0], [-2.0, 1.0]] },
      { input: [2, 0, 0, 3], expected: [[3.0, 0.0], [0.0, 2.0]] },
      { input: [1, 1, 1, 1], expected: [[1.0, -1.0], [-1.0, 1.0]] },
      { input: [0, 0, 0, 0], expected: [[0.0, 0.0], [0.0, 0.0]] },
    ],
    hint: "Each partial derivative is the cofactor of the corresponding entry.",
  },
  {
    id: "ca-142",
    title: "Green's Theorem Area",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "Green's theorem gives the area enclosed by a simple closed curve as A = 0.5 * |closed integral of (x dy - y dx)|.\n\nFor a polygon given by its vertices in order, this becomes the shoelace formula 0.5 * |sum of (x_i * y_{i+1} - x_{i+1} * y_i)|. Return 0.0 for fewer than 3 vertices.",
    starterCode: `def polygon_area(vertices):
    # vertices is a list of [x, y] pairs in order
    # Your code here
    pass`,
    solution: `def polygon_area(vertices):
    n = len(vertices)
    if n < 3:
        return 0.0
    total = 0.0
    for i in range(n):
        x1, y1 = vertices[i]
        x2, y2 = vertices[(i + 1) % n]
        total += x1 * y2 - x2 * y1
    return abs(total) / 2.0`,
    testCases: [
      { input: [[[0, 0], [1, 0], [1, 1], [0, 1]]], expected: 1.0 },
      { input: [[[0, 0], [2, 0], [0, 2]]], expected: 2.0 },
      { input: [[[0, 0]]], expected: 0.0 },
      { input: [[[0, 0], [4, 0], [4, 3]]], expected: 6.0 },
      { input: [[[1, 1], [3, 1], [3, 2], [1, 2]]], expected: 2.0 },
    ],
    hint: "The edge from the last vertex back to the first closes the loop.",
  },
  {
    id: "ca-143",
    title: "Flux Through Cube Face",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "The field F(x, y, z) = [a*x + b, c*y, d*z] is integrated over the face x = 1 of the unit cube [0, 1]^3 with outward normal (1, 0, 0).\n\nOn that face F_x = a + b is constant and the face area is 1, so the flux is simply a + b. Return that value.",
    starterCode: `def flux_cube_face(a, b, c, d):
    # Your code here
    pass`,
    solution: `def flux_cube_face(a, b, c, d):
    return a * 1.0 + b`,
    testCases: [
      { input: [2, 3, 4, 5], expected: 5.0 },
      { input: [0, 0, 1, 1], expected: 0.0 },
      { input: [1, -2, 0, 0], expected: -1.0 },
      { input: [10, 0, 0, 0], expected: 10.0 },
    ],
    hint: "Only the component along the outward normal contributes to the flux.",
  },
  {
    id: "ca-144",
    title: "Spherical Radial Laplacian",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "For a radially symmetric function f(r) = r^n, the Laplacian in spherical coordinates reduces to f'' + (2/r) * f'.\n\nThis equals n * (n + 1) * r^(n - 2). Given n and r > 0, return that value.",
    starterCode: `def spherical_radial_laplacian(n, r):
    # Your code here
    pass`,
    solution: `def spherical_radial_laplacian(n, r):
    return n * (n + 1) * r ** (n - 2)`,
    testCases: [
      { input: [2, 3], expected: 6.0 },
      { input: [1, 2], expected: 1.0 },
      { input: [0, 5], expected: 0.0 },
      { input: [-1, 2], expected: 0.0 },
      { input: [3, 1], expected: 12.0 },
    ],
    hint: "Only the radial part of the spherical Laplacian is nonzero for a radial function.",
  },
  {
    id: "ca-145",
    title: "Inverse Function Theorem Jacobian",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "The inverse function theorem states that the Jacobian of the inverse map at a point is the inverse of the Jacobian at the corresponding point.\n\nFor J = [[a, b], [c, d]], return (1 / det) * [[d, -b], [-c, a]], or None when det = a*d - b*c == 0.",
    starterCode: `def inverse_jacobian(a, b, c, d):
    # Return the inverse 2x2 matrix, or None
    # Your code here
    pass`,
    solution: `def inverse_jacobian(a, b, c, d):
    det = a * d - b * c
    if det == 0:
        return None
    return [[d / det, -b / det], [-c / det, a / det]]`,
    testCases: [
      { input: [1, 0, 0, 1], expected: [[1.0, 0.0], [0.0, 1.0]] },
      { input: [2, 1, 1, 1], expected: [[1.0, -1.0], [-1.0, 2.0]] },
      { input: [1, 2, 3, 4], expected: [[-2.0, 1.0], [1.5, -0.5]] },
      { input: [2, 4, 1, 2], expected: null },
    ],
    hint: "The inverse is the adjugate divided by the determinant; a zero determinant means no local inverse.",
  },
  {
    id: "ca-146",
    title: "Spherical Jacobian Factor",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "In spherical coordinates (r, phi, theta) with phi measured from the positive z-axis, the volume element is dV = r^2 * sin(phi) dr dphi dtheta.\n\nGiven r and the polar angle phi in radians, return the Jacobian factor r^2 * sin(phi).",
    starterCode: `def spherical_jacobian(r, phi):
    # Your code here
    pass`,
    solution: `def spherical_jacobian(r, phi):
    import math
    return r * r * math.sin(phi)`,
    testCases: [
      { input: [2, 1.5707963267948966], expected: 4.0 },
      { input: [1, 0], expected: 0.0 },
      { input: [3, 0.5235987755982988], expected: 4.499999999999999 },
      { input: [0, 1], expected: 0.0 },
    ],
    hint: "The factor vanishes at the poles where sin(phi) = 0.",
  },
  {
    id: "ca-147",
    title: "Logistic Map Derivative",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "The logistic map is f(x) = r * x * (1 - x). Its derivative is f'(x) = r * (1 - 2x), which controls whether nearby orbits converge or diverge.\n\nGiven the parameter r and the state x, return f'(x).",
    starterCode: `def logistic_map_derivative(r, x):
    # Your code here
    pass`,
    solution: `def logistic_map_derivative(r, x):
    return r * (1 - 2 * x)`,
    testCases: [
      { input: [4, 0.5], expected: 0.0 },
      { input: [3, 0.25], expected: 1.5 },
      { input: [2, 0], expected: 2.0 },
      { input: [1, 0.5], expected: 0.0 },
      { input: [4, 0], expected: 4.0 },
    ],
    hint: "Differentiate r * x * (1 - x) with respect to x.",
  },
  {
    id: "ca-148",
    title: "Newton Fractal Step",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "Take one Newton step of p(z) = z^2 - 2 for the complex number z given as [re, im].\n\nThe update is z_new = z - (z^2 - 2) / (2z). Implement complex arithmetic with pairs and return the result as [re, im]. Assume z is not zero.",
    starterCode: `def newton_fractal_step(z):
    # z is [re, im]; return [re, im]
    # Your code here
    pass`,
    solution: `def newton_fractal_step(z):
    a = z[0]
    b = z[1]
    zr = a * a - b * b - 2.0
    zi = 2.0 * a * b
    dr = 2.0 * a
    di = 2.0 * b
    den = dr * dr + di * di
    qr = (zr * dr + zi * di) / den
    qi = (zi * dr - zr * di) / den
    return [a - qr, b - qi]`,
    testCases: [
      { input: [[1, 0]], expected: [1.5, 0.0] },
      { input: [[1, 1]], expected: [1.0, 0.0] },
      { input: [[0, 1]], expected: [0.0, -0.5] },
      { input: [[2, 0]], expected: [1.5, 0.0] },
    ],
    hint: "Divide complex numbers by multiplying numerator and denominator by the conjugate.",
  },
  {
    id: "ca-149",
    title: "Residue at Simple Pole",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "If z0 is a simple pole of F(z) = P(z) / Q(z), the residue there is P(z0) / Q'(z0).\n\nGiven polynomial coefficient lists for P and Q and the real pole z0 (with Q(z0) = 0 and Q'(z0) != 0), return the residue.",
    starterCode: `def residue_simple_pole(p_coeffs, q_coeffs, z0):
    # Your code here
    pass`,
    solution: `def residue_simple_pole(p_coeffs, q_coeffs, z0):
    def ev(coeffs, t):
        return sum(c * t ** i for i, c in enumerate(coeffs))
    def dv(coeffs, t):
        return sum(i * c * t ** (i - 1) for i, c in enumerate(coeffs) if i > 0)
    return ev(p_coeffs, z0) / dv(q_coeffs, z0)`,
    testCases: [
      { input: [[1], [-1, 0, 1], 1], expected: 0.5 },
      { input: [[0, 1], [-1, 0, 1], -1], expected: 0.5 },
      { input: [[2], [-2, 1], 2], expected: 2.0 },
      { input: [[1, 1], [-4, 0, 1], 2], expected: 0.75 },
    ],
    hint: "At a simple pole the residue is the limit of (z - z0) * F(z).",
  },
  {
    id: "ca-150",
    title: "Fourier Transform of Gaussian",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "The Fourier transform of the Gaussian e^(-a*x^2) is sqrt(pi/a) * e^(-omega^2/(4a)).\n\nSince the transform is real and positive, its magnitude equals its value. Given a > 0 and the angular frequency omega, return that magnitude.",
    starterCode: `def gaussian_ft_magnitude(a, omega):
    # Your code here
    pass`,
    solution: `def gaussian_ft_magnitude(a, omega):
    import math
    return math.sqrt(math.pi / a) * math.exp(-omega * omega / (4.0 * a))`,
    testCases: [
      { input: [1, 0], expected: 1.7724538509055159 },
      { input: [1, 1], expected: 1.380388447043143 },
      { input: [4, 0], expected: 0.8862269254527579 },
      { input: [0.25, 2], expected: 0.06492724936026344 },
    ],
    hint: "A Gaussian transforms to a Gaussian: wider in x means narrower in frequency.",
  },
  {
    id: "ca-151",
    title: "Nyquist Sampling Rate",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "The Nyquist-Shannon sampling theorem requires sampling above twice the highest frequency present in the signal.\n\nGiven a list of frequencies in Hz, return the Nyquist rate 2 * max(freqs), or 0.0 for an empty list.",
    starterCode: `def nyquist_rate(freqs):
    # Your code here
    pass`,
    solution: `def nyquist_rate(freqs):
    if not freqs:
        return 0.0
    return 2.0 * max(freqs)`,
    testCases: [
      { input: [[10]], expected: 20.0 },
      { input: [[1, 5, 3]], expected: 10.0 },
      { input: [[]], expected: 0.0 },
      { input: [[0.5]], expected: 1.0 },
    ],
    hint: "Only the highest frequency component determines the required rate.",
  },
  {
    id: "ca-152",
    title: "Aliasing Frequency",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "When a sinusoid of frequency f is sampled at rate fs, it appears as an alias at the frequency closest to f among the shifts by multiples of fs.\n\nReturn the folded frequency |f - fs * round(f / fs)|, which always lies in [0, fs/2].",
    starterCode: `def aliased_frequency(f, fs):
    # Your code here
    pass`,
    solution: `def aliased_frequency(f, fs):
    return abs(f - fs * round(f / fs))`,
    testCases: [
      { input: [100, 60], expected: 20.0 },
      { input: [10, 100], expected: 10.0 },
      { input: [60, 100], expected: 40.0 },
      { input: [250, 100], expected: 50.0 },
      { input: [0, 50], expected: 0.0 },
    ],
    hint: "Aliasing folds frequencies above the Nyquist limit back into the baseband.",
  },
  {
    id: "ca-153",
    title: "Hann Window Value",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "The Hann window of length size is w[n] = 0.5 - 0.5 * cos(2*pi*n / (size - 1)) for n = 0, ..., size - 1.\n\nGiven the index n and the window length size > 1, return w[n]. The window tapers to zero at both endpoints.",
    starterCode: `def hann_window(n, size):
    # Your code here
    pass`,
    solution: `def hann_window(n, size):
    import math
    return 0.5 - 0.5 * math.cos(2.0 * math.pi * n / (size - 1))`,
    testCases: [
      { input: [0, 5], expected: 0.0 },
      { input: [4, 5], expected: 0.0 },
      { input: [2, 5], expected: 1.0 },
      { input: [1, 5], expected: 0.49999999999999994 },
    ],
    hint: "The window is symmetric and reaches its maximum at the center index.",
  },
  {
    id: "ca-154",
    title: "Z-Transform of Geometric Sequence",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "The z-transform of x[n] = a^n for n >= 0 is X(z) = sum of a^n * z^(-n) = z / (z - a), converging for |z| > |a|.\n\nGiven a and z with z != a, return X(z).",
    starterCode: `def z_transform_geometric(a, z):
    # Your code here
    pass`,
    solution: `def z_transform_geometric(a, z):
    return z / (z - a)`,
    testCases: [
      { input: [0.5, 2], expected: 1.3333333333333333 },
      { input: [0, 3], expected: 1.0 },
      { input: [2, 4], expected: 2.0 },
      { input: [0.5, -1], expected: 0.6666666666666666 },
    ],
    hint: "This is a geometric series in a / z; sum it in closed form.",
  },
  {
    id: "ca-155",
    title: "Settling Time Estimate",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "For a second-order system with damping ratio zeta and natural frequency omega_n, the 2-percent settling time is commonly estimated as t_s = 4 / (zeta * omega_n).\n\nGiven zeta > 0 and omega_n > 0, return this estimate.",
    starterCode: `def settling_time(zeta, omega_n):
    # Your code here
    pass`,
    solution: `def settling_time(zeta, omega_n):
    return 4.0 / (zeta * omega_n)`,
    testCases: [
      { input: [0.5, 4], expected: 2.0 },
      { input: [0.2, 5], expected: 4.0 },
      { input: [0.8, 2], expected: 2.5 },
      { input: [0.25, 2], expected: 8.0 },
    ],
    hint: "The envelope decays like e^(-zeta*omega_n*t); four time constants give 2 percent.",
  },
  {
    id: "ca-156",
    title: "Chebyshev Ripple Factor",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "A Chebyshev type I filter with passband ripple Rp decibels has ripple factor epsilon = sqrt(10^(Rp/10) - 1).\n\nGiven Rp >= 0, return epsilon. A zero ripple gives epsilon = 0.",
    starterCode: `def chebyshev_ripple(rp_db):
    # Your code here
    pass`,
    solution: `def chebyshev_ripple(rp_db):
    import math
    return math.sqrt(10 ** (rp_db / 10.0) - 1.0)`,
    testCases: [
      { input: [1], expected: 0.5088471399095875 },
      { input: [0], expected: 0.0 },
      { input: [3], expected: 0.9976283451109834 },
      { input: [0.5], expected: 0.34931140018894796 },
    ],
    hint: "The ripple in decibels converts to a linear amplitude ratio before solving for epsilon.",
  },
  {
    id: "ca-157",
    title: "Divergence Theorem Flux Numeric",
    category: "Calculus",
    difficulty: "Hard",
    description:
      "Compute the outward flux of F = [a*x + d, b*y + e, c*z + f] through the surface of the unit cube [0, 1]^3 numerically.\n\nSample each face on a 2x2 midpoint grid and add F dotted with the outward normal times the cell area 0.25. For this linear field the midpoint rule is exact, so the result equals the divergence integral a + b + c.",
    starterCode: `def flux_cube_numeric(a, b, c, d, e, f):
    # Your code here
    pass`,
    solution: `def flux_cube_numeric(a, b, c, d, e, f):
    offs = [0.25, 0.75]
    total = 0.0
    for u in offs:
        for v in offs:
            total += 0.25 * (-(a * 0.0 + d) + (a * 1.0 + d))
            total += 0.25 * (-(b * 0.0 + e) + (b * 1.0 + e))
            total += 0.25 * (-(c * 0.0 + f) + (c * 1.0 + f))
    return total`,
    testCases: [
      { input: [1, 1, 1, 5, 6, 7], expected: 3.0 },
      { input: [2, -1, 0.5, 0, 0, 0], expected: 1.5 },
      { input: [0, 0, 0, 3, 4, 5], expected: 0.0 },
      { input: [10, 0, -2, 0, 0, 0], expected: 8.0 },
    ],
    hint: "The constant offsets cancel between opposite faces; only the linear coefficients survive.",
  },
  {
    id: "ca-158",
    title: "Stokes Circulation Numeric",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "Compute the counterclockwise circulation of F = [-c*y, c*x] around the boundary of the unit square [0, 1]^2.\n\nParameterize each edge and apply the midpoint rule with n segments per edge. Since the field is linear the midpoint rule is exact and the circulation equals 2c, matching the curl integral.",
    starterCode: `def stokes_circulation(c, n):
    # Your code here
    pass`,
    solution: `def stokes_circulation(c, n):
    total = 0.0
    h = 1.0 / n
    for i in range(n):
        t = (i + 0.5) * h
        total += (-c * 0.0) * h
        total += (c * 1.0) * h
        total += (-c * 1.0) * (-h)
        total += 0.0 * (-h)
    return total`,
    testCases: [
      { input: [1, 4], expected: 2.0 },
      { input: [-2, 10], expected: -4.0 },
      { input: [0, 5], expected: 0.0 },
      { input: [3, 1], expected: 6.0 },
    ],
    hint: "Only the right and top edges contribute; the field is tangent to the bottom edge and zero along the left one.",
  },
  {
    id: "ca-159",
    title: "Surface Integral over Plane",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "Integrate z = a - b*x - c*y over the triangle T with vertices (0,0), (1,0), (0,1).\n\nUsing the triangle's centroid (1/3, 1/3) the integral is a/2 - b/6 - c/6. Given a, b, c, return the value of this integral.",
    starterCode: `def surface_integral_plane(a, b, c):
    # Your code here
    pass`,
    solution: `def surface_integral_plane(a, b, c):
    return a / 2.0 - b / 6.0 - c / 6.0`,
    testCases: [
      { input: [1, 1, 1], expected: 0.1666666666666667 },
      { input: [6, 0, 0], expected: 3.0 },
      { input: [0, 1, 0], expected: -0.16666666666666666 },
      { input: [2, 3, 3], expected: 0.0 },
    ],
    hint: "The average of a linear function over a triangle is its value at the centroid.",
  },
  {
    id: "ca-160",
    title: "Divergence of Curl Identity Check",
    category: "Calculus",
    difficulty: "Hard",
    description:
      "The identity div(curl F) = 0 holds for smooth fields. Verify it numerically for F = [a*y*z^2, b*z*x^2, c*x*y^2].\n\nCompute the curl with central differences (step h = 1e-5), then take the central-difference divergence of that curl. The return value is the residual, which should be near 0.0.",
    starterCode: `def div_of_curl_check(a, b, c, x, y, z, h=1e-5):
    # Your code here
    pass`,
    solution: `def div_of_curl_check(a, b, c, x, y, z, h=1e-5):
    def P(u, v, w):
        return a * v * w * w
    def Q(u, v, w):
        return b * w * u * u
    def R(u, v, w):
        return c * u * v * v
    def curl(u, v, w):
        dR_dy = (R(u, v + h, w) - R(u, v - h, w)) / (2 * h)
        dQ_dz = (Q(u, v, w + h) - Q(u, v, w - h)) / (2 * h)
        dP_dz = (P(u, v, w + h) - P(u, v, w - h)) / (2 * h)
        dR_dx = (R(u + h, v, w) - R(u - h, v, w)) / (2 * h)
        dQ_dx = (Q(u + h, v, w) - Q(u - h, v, w)) / (2 * h)
        dP_dy = (P(u, v + h, w) - P(u, v - h, w)) / (2 * h)
        return [dR_dy - dQ_dz, dP_dz - dR_dx, dQ_dx - dP_dy]
    c0 = curl(x, y, z)
    cxp = curl(x + h, y, z)
    cxm = curl(x - h, y, z)
    cyp = curl(x, y + h, z)
    cym = curl(x, y - h, z)
    czp = curl(x, y, z + h)
    czm = curl(x, y, z - h)
    return (
        (cxp[0] - cxm[0]) / (2 * h)
        + (cyp[1] - cym[1]) / (2 * h)
        + (czp[2] - czm[2]) / (2 * h)
    )`,
    testCases: [
      { input: [1, 1, 1, 1, 2, 3], expected: 0.0 },
      { input: [2, -3, 4, -1, 0.5, 2], expected: 0.0 },
      { input: [0, 1, 0, 3, 3, 3], expected: 0.0 },
      { input: [-1, 2, -2, 0, 1, -1], expected: 0.0 },
    ],
    hint: "Two applications of central differences should cancel to within round-off.",
  },
  {
    id: "ca-161",
    title: "Curl of Gradient Identity Check",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "The identity curl(grad f) = 0 holds for any smooth scalar field f. Verify it numerically for f = a*x^2*y + b*y^2*z + c*z^2*x.\n\nCompute the gradient and then its curl with central differences (step h = 1e-5) and return the Euclidean norm of the resulting vector, which should be near 0.0.",
    starterCode: `def curl_of_gradient_check(a, b, c, x, y, z, h=1e-5):
    # Your code here
    pass`,
    solution: `def curl_of_gradient_check(a, b, c, x, y, z, h=1e-5):
    def f(u, v, w):
        return a * u * u * v + b * v * v * w + c * w * w * u
    def grad(u, v, w):
        fx = (f(u + h, v, w) - f(u - h, v, w)) / (2 * h)
        fy = (f(u, v + h, w) - f(u, v - h, w)) / (2 * h)
        fz = (f(u, v, w + h) - f(u, v, w - h)) / (2 * h)
        return [fx, fy, fz]
    gxp = grad(x + h, y, z)
    gxm = grad(x - h, y, z)
    gyp = grad(x, y + h, z)
    gym = grad(x, y - h, z)
    gzp = grad(x, y, z + h)
    gzm = grad(x, y, z - h)
    curl_x = (gyp[2] - gym[2]) / (2 * h) - (gzp[1] - gzm[1]) / (2 * h)
    curl_y = (gzp[0] - gzm[0]) / (2 * h) - (gxp[2] - gxm[2]) / (2 * h)
    curl_z = (gxp[1] - gxm[1]) / (2 * h) - (gyp[0] - gym[0]) / (2 * h)
    return (curl_x * curl_x + curl_y * curl_y + curl_z * curl_z) ** 0.5`,
    testCases: [
      { input: [1, 1, 1, 1, 2, 3], expected: 0.0 },
      { input: [2, -1, 0.5, 0.5, -1, 2], expected: 0.0 },
      { input: [0, 3, 2, 2, 2, 2], expected: 0.0 },
      { input: [-2, 1, -1, 1, 1, 1], expected: 0.0 },
    ],
    hint: "Gradients are curl-free; the mixed partials cancel pairwise.",
  },
  {
    id: "ca-162",
    title: "Laplacian in Polar Coordinates",
    category: "Calculus",
    difficulty: "Hard",
    description:
      "In polar coordinates the Laplacian is Laplacian(f) = f_rr + (1/r)*f_r + (1/r^2)*f_theta_theta.\n\nCompute each term with central differences (step h = 1e-5) for the function given by the coefficient grid coeffs[i][j] * r^i * theta^j and evaluate at (r, theta). Ragged rows are allowed.",
    starterCode: `def polar_laplacian(coeffs, r, theta, h=1e-5):
    # Your code here
    pass`,
    solution: `def polar_laplacian(coeffs, r, theta, h=1e-5):
    def f(u, v):
        total = 0.0
        for i, row in enumerate(coeffs):
            for j, c in enumerate(row):
                total += c * u ** i * v ** j
        return total
    frr = (f(r + h, theta) - 2 * f(r, theta) + f(r - h, theta)) / (h * h)
    fr = (f(r + h, theta) - f(r - h, theta)) / (2 * h)
    ftt = (f(r, theta + h) - 2 * f(r, theta) + f(r, theta - h)) / (h * h)
    return frr + fr / r + ftt / (r * r)`,
    testCases: [
      { input: [[[0, 0], [0, 0], [1, 0]], 2, 0.5], expected: 4.000000165493844 },
      { input: [[[0, 1]], 2, 0.5], expected: -1.3877787807814454e-07 },
      { input: [[[0, 0], [0, 0], [0, 1]], 2, 0.5], expected: 1.99999952763541 },
      { input: [[[], [0, 0, 1]], 2, 1], expected: 1.500001192966671 },
    ],
    hint: "The 1/r and 1/r^2 weights distinguish this from the Cartesian Laplacian.",
  },
  {
    id: "ca-163",
    title: "Gradient in Polar Coordinates",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "In polar coordinates the gradient of f has components f_r along the radial direction and (1/r)*f_theta along the angular direction.\n\nFor the function given by the coefficient grid coeffs[i][j] * r^i * theta^j, compute the two partials with central differences (h = 1e-6) and return [f_r, f_theta / r] at (r, theta).",
    starterCode: `def polar_gradient(coeffs, r, theta, h=1e-6):
    # Return [f_r, f_theta / r]
    # Your code here
    pass`,
    solution: `def polar_gradient(coeffs, r, theta, h=1e-6):
    def f(u, v):
        total = 0.0
        for i, row in enumerate(coeffs):
            for j, c in enumerate(row):
                total += c * u ** i * v ** j
        return total
    fr = (f(r + h, theta) - f(r - h, theta)) / (2 * h)
    ft = (f(r, theta + h) - f(r, theta - h)) / (2 * h)
    return [fr, ft / r]`,
    testCases: [
      { input: [[[0, 0], [0, 0], [1, 0]], 3, 1], expected: [6.0, 0.0] },
      { input: [[[0, 1]], 2, 3], expected: [0.0, 0.5] },
      { input: [[[], [0, 1]], 2, 3], expected: [3.0, 1.0] },
      { input: [[[0, 0], [0, 0], [0, 1]], 1, 2], expected: [4.0, 1.0] },
    ],
    hint: "The angular component must be divided by r to get a physical length scale.",
  },
  {
    id: "ca-164",
    title: "Hessian in 1D Finite Difference",
    category: "Calculus",
    difficulty: "Hard",
    description:
      "The five-point central stencil for the second derivative is\n\nf''(x) ≈ (-f(x+2h) + 16*f(x+h) - 30*f(x) + 16*f(x-h) - f(x-2h)) / (12*h^2)\n\nwhich is exact for polynomials up to degree 5. Apply it to f(x) = sum(coeffs[i] * x^i) at x with h = 1e-3.",
    starterCode: `def hessian_1d_5point(coeffs, x, h=1e-3):
    # Your code here
    pass`,
    solution: `def hessian_1d_5point(coeffs, x, h=1e-3):
    def f(t):
        return sum(c * t ** i for i, c in enumerate(coeffs))
    return (-f(x + 2 * h) + 16 * f(x + h) - 30 * f(x) + 16 * f(x - h) - f(x - 2 * h)) / (12 * h * h)`,
    testCases: [
      { input: [[0, 0, 1], 1], expected: 2.0 },
      { input: [[0, 0, 0, 0, 1], 1], expected: 12.0 },
      { input: [[0, 0, 0, 1], 2], expected: 12.0 },
      { input: [[5], 3], expected: 0.0 },
    ],
    hint: "The weights -1, 16, -30, 16, -1 over 12 h^2 give fourth-order accuracy.",
  },
  {
    id: "ca-165",
    title: "Taylor Expansion 2D Quadratic",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "Evaluate the general quadratic f(x, y) = c0 + cx*x + cy*y + 0.5*cxx*x^2 + cxy*x*y + 0.5*cyy*y^2 at (x0 + dx, y0 + dy) using its second-order Taylor expansion about (x0, y0).\n\nBecause f is quadratic the expansion is exact: f + fx*dx + fy*dy + 0.5*(fxx*dx^2 + 2*fxy*dx*dy + fyy*dy^2). Return the value.",
    starterCode: `def taylor2d_quadratic(c0, cx, cy, cxx, cxy, cyy, x0, y0, dx, dy):
    # Your code here
    pass`,
    solution: `def taylor2d_quadratic(c0, cx, cy, cxx, cxy, cyy, x0, y0, dx, dy):
    f0 = c0 + cx * x0 + cy * y0 + 0.5 * cxx * x0 * x0 + cxy * x0 * y0 + 0.5 * cyy * y0 * y0
    fx = cx + cxx * x0 + cxy * y0
    fy = cy + cxy * x0 + cyy * y0
    return f0 + fx * dx + fy * dy + 0.5 * (cxx * dx * dx + 2 * cxy * dx * dy + cyy * dy * dy)`,
    testCases: [
      { input: [0, 0, 0, 2, 0, 0, 1, 0, 0.1, 0], expected: 1.21 },
      { input: [0, 0, 0, 0, 1, 0, 2, 3, 0.5, -0.5], expected: 6.25 },
      { input: [5, 0, 0, 0, 0, 0, 1, 1, 2, 3], expected: 5.0 },
      { input: [1, 2, 3, 0.5, 1, 2, 1, 1, 0.5, 0.5], expected: 13.5625 },
    ],
    hint: "Collect the value, the gradient term, and the Hessian term at the expansion point.",
  },
  {
    id: "ca-166",
    title: "Saddle Classification 2D",
    category: "Calculus",
    difficulty: "Hard",
    description:
      "Find and classify the critical points of f(x, y) = x^3 - 3x + y^2 on the line y = 0.\n\nThe critical x values satisfy 3x^2 - 3 = 0 and the Hessian is [[6x, 0], [0, 2]]. Classify the point (x, y): return \"saddle\" when the determinant is negative, \"minimum\" or \"maximum\" when it is positive according to the sign of H_xx, and \"degenerate\" when it is zero.",
    starterCode: `def saddle_classify_2d(x, y):
    # Your code here
    pass`,
    solution: `def saddle_classify_2d(x, y):
    hxx = 6.0 * x
    hyy = 2.0
    hxy = 0.0
    det = hxx * hyy - hxy * hxy
    if det < 0:
        return "saddle"
    if det > 0:
        if hxx > 0:
            return "minimum"
        return "maximum"
    return "degenerate"`,
    testCases: [
      { input: [1, 0], expected: "minimum" },
      { input: [-1, 0], expected: "saddle" },
      { input: [0, 0], expected: "degenerate" },
      { input: [0.5, 0], expected: "minimum" },
    ],
    hint: "At x = 0 the Hessian is only positive semidefinite, so the second derivative test is inconclusive.",
  },
  {
    id: "ca-167",
    title: "Implicit Function Theorem Slope",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "The curve x^a * y^b = c defines y implicitly as a function of x for x, y > 0.\n\nBy the implicit function theorem, dy/dx = -F_x / F_y = -a*y / (b*x). Given a, b > 0 and the point (x, y), return that slope.",
    starterCode: `def implicit_slope_power(a, b, x, y):
    # Your code here
    pass`,
    solution: `def implicit_slope_power(a, b, x, y):
    return -a * y / (b * x)`,
    testCases: [
      { input: [2, 3, 1, 2], expected: -1.3333333333333333 },
      { input: [1, 1, 3, 4], expected: -1.3333333333333333 },
      { input: [1, 2, 2, 1], expected: -0.25 },
      { input: [3, 3, 1, 1], expected: -1.0 },
    ],
    hint: "Differentiate F(x, y) = x^a y^b - c partially with respect to each variable.",
  },
  {
    id: "ca-168",
    title: "Polar Area Integral",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "Evaluate the polar integral of x^2 + y^2 over the disk of radius R.\n\nThe change to polar coordinates with Jacobian r gives the integral of r^3 dr dtheta, which equals pi * R^4 / 2. Given R >= 0, return this value using 3.141592653589793 for pi.",
    starterCode: `def polar_moment(radius):
    # Your code here
    pass`,
    solution: `def polar_moment(radius):
    return 3.141592653589793 * radius ** 4 / 2.0`,
    testCases: [
      { input: [1], expected: 1.5707963267948966 },
      { input: [2], expected: 25.132741228718345 },
      { input: [0], expected: 0.0 },
      { input: [0.5], expected: 0.09817477042468103 },
    ],
    hint: "The integrand becomes r^2 and the area element becomes r dr dtheta.",
  },
  {
    id: "ca-169",
    title: "Envelope Theorem Derivative",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "Maximize f(x, theta) = a*x - 0.5*b*x^2 + c*theta*x over x. The optimizer is x*(theta) = (a + c*theta) / b and the value function is V(theta) = f(x*(theta), theta).\n\nBy the envelope theorem V'(theta) equals the partial derivative of f with respect to theta at the optimum, which is c*x*. Given a, b != 0, c, and theta, return V'(theta).",
    starterCode: `def envelope_derivative(a, b, c, theta):
    # Your code here
    pass`,
    solution: `def envelope_derivative(a, b, c, theta):
    return c * (a + c * theta) / b`,
    testCases: [
      { input: [1, 2, 3, 0], expected: 1.5 },
      { input: [0, 1, 2, 5], expected: 20.0 },
      { input: [2, 4, -1, 1], expected: -0.25 },
      { input: [5, 1, 0, 3], expected: 0.0 },
    ],
    hint: "Differentiate f with respect to theta, then substitute the optimal x.",
  },
  {
    id: "ca-170",
    title: "Optimum Sensitivity",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "Minimize f(x, y) = 0.5*a*x^2 + 0.5*b*y^2 subject to the equality constraint x + y = s.\n\nThe KKT solution is x* = s*b/(a + b) and y* = s*a/(a + b). Return the sensitivities [dx*/ds, dy*/ds], which are b/(a+b) and a/(a+b). The parameter s cancels, and a + b > 0.",
    starterCode: `def optimum_sensitivity(a, b, s):
    # Return [dx_ds, dy_ds]
    # Your code here
    pass`,
    solution: `def optimum_sensitivity(a, b, s):
    return [b / (a + b), a / (a + b)]`,
    testCases: [
      { input: [1, 1, 5], expected: [0.5, 0.5] },
      { input: [2, 1, 3], expected: [0.3333333333333333, 0.6666666666666666] },
      { input: [3, 6, 1], expected: [0.6666666666666666, 0.3333333333333333] },
      { input: [1, 4, 2], expected: [0.8, 0.2] },
    ],
    hint: "Solve the equality-constrained problem, then differentiate the optimizer with respect to s.",
  },
  {
    id: "ca-171",
    title: "Lyapunov Exponent 1D Map",
    category: "Calculus",
    difficulty: "Hard",
    description:
      "The Lyapunov exponent of the logistic map measures the average exponential separation of nearby orbits:\n\nlambda = (1/n) * sum of ln|f'(x_k)| along the orbit.\n\nIterate x = r*x*(1-x) for n steps starting from x0, accumulating ln|r*(1 - 2x)| before each update, and return the average. A positive exponent signals chaos.",
    starterCode: `def lyapunov_exponent(r, x0, n):
    # Your code here
    pass`,
    solution: `def lyapunov_exponent(r, x0, n):
    import math
    x = x0
    total = 0.0
    for _ in range(n):
        total += math.log(abs(r * (1 - 2 * x)))
        x = r * x * (1 - x)
    return total / n`,
    testCases: [
      { input: [4, 0.1, 1000], expected: 0.6934349555043721 },
      { input: [4, 0.123456, 500], expected: 0.6939785071798493 },
      { input: [3.8, 0.2, 500], expected: 0.41391435195894055 },
      { input: [4, 0.3, 2000], expected: 0.6929468914389755 },
    ],
    hint: "At r = 4 the theoretical Lyapunov exponent is ln(2), about 0.6931.",
  },
  {
    id: "ca-172",
    title: "Bifurcation Parameter Check",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "The logistic map has the nonzero fixed point x* = 1 - 1/r for r > 1, with multiplier f'(x*) = 2 - r.\n\nThe fixed point is attracting when |2 - r| < 1, that is for 1 < r < 3. Given r, return True when the fixed point is stable and False otherwise.",
    starterCode: `def bifurcation_stable(r):
    # Your code here
    pass`,
    solution: `def bifurcation_stable(r):
    return abs(2 - r) < 1`,
    testCases: [
      { input: [2.5], expected: true },
      { input: [3.2], expected: false },
      { input: [3.0], expected: false },
      { input: [1.5], expected: true },
      { input: [0.5], expected: false },
    ],
    hint: "At r = 3 the multiplier reaches -1 and the period-doubling cascade begins.",
  },
  {
    id: "ca-173",
    title: "Parseval Energy Check",
    category: "Calculus",
    difficulty: "Hard",
    description:
      "Parseval's theorem says the time-domain energy of a length-N sequence equals (1/N) times the frequency-domain energy, where X[k] = sum of x[n]*e^(-2*pi*i*k*n/N).\n\nCompute the DFT with real arithmetic and return (1/N) * sum of |X[k]|^2, which equals the sum of x[n]^2.",
    starterCode: `def parseval_energy(x):
    # Your code here
    pass`,
    solution: `def parseval_energy(x):
    import math
    n = len(x)
    total = 0.0
    for k in range(n):
        re = 0.0
        im = 0.0
        for i in range(n):
            angle = -2.0 * math.pi * k * i / n
            re += x[i] * math.cos(angle)
            im += x[i] * math.sin(angle)
        total += re * re + im * im
    return total / n`,
    testCases: [
      { input: [[1, 0, 0, 0]], expected: 1.0 },
      { input: [[1, 1, 1, 1]], expected: 4.0 },
      { input: [[1, -1, 1, -1]], expected: 4.0 },
      { input: [[0.5, 0.5]], expected: 0.5 },
    ],
    hint: "Expand the squared magnitude of the DFT and use the orthogonality of complex exponentials.",
  },
  {
    id: "ca-174",
    title: "DFT Leakage Lite",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "When a sinusoid lies delta bins away from an integer DFT bin, the peak bin magnitude of a rectangular window of length N is scaled by\n\nL = |sin(pi*delta)| / (N * |sin(pi*delta / N)|)\n\nReturn L for N > 0 and delta >= 0, with L = 1.0 when delta is exactly 0.",
    starterCode: `def dft_leakage(n, delta):
    # Your code here
    pass`,
    solution: `def dft_leakage(n, delta):
    import math
    if delta == 0:
        return 1.0
    return abs(math.sin(math.pi * delta) / (n * math.sin(math.pi * delta / n)))`,
    testCases: [
      { input: [8, 0], expected: 1.0 },
      { input: [8, 0.5], expected: 0.6407288619353766 },
      { input: [16, 1], expected: 0.0 },
      { input: [4, 0.25], expected: 0.9061274463528879 },
    ],
    hint: "This is the Dirichlet kernel magnitude divided by N; it decays away from integer bins.",
  },
  {
    id: "ca-175",
    title: "Difference Equation Solve",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "Solve the first-order linear recurrence y[n] = a*y[n-1] + b with y[0] = y0 in closed form.\n\nFor a != 1 the solution is y[n] = a^n * y0 + b * (1 - a^n) / (1 - a); for a = 1 it is y[n] = y0 + n*b. Given a, b, y0, and n >= 0, return y[n].",
    starterCode: `def difference_equation(a, b, y0, n):
    # Your code here
    pass`,
    solution: `def difference_equation(a, b, y0, n):
    if a == 1:
        return y0 + n * b
    return a ** n * y0 + b * (1 - a ** n) / (1 - a)`,
    testCases: [
      { input: [0.5, 1, 0, 3], expected: 1.75 },
      { input: [1, 2, 5, 4], expected: 13.0 },
      { input: [2, 0, 3, 5], expected: 96.0 },
      { input: [0.5, 2, 1, 10], expected: 3.9970703125 },
    ],
    hint: "The fixed point b/(1-a) plus a transient a^n controls the solution.",
  },
  {
    id: "ca-176",
    title: "Bilinear Transform",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "The bilinear transform maps a continuous-time pole or zero s to the discrete-time location\n\nz = (2/T + s) / (2/T - s)\n\nwhere T is the sampling period. Given s and T > 0, return z. The left half-plane maps inside the unit circle.",
    starterCode: `def bilinear_transform(s, t):
    # Your code here
    pass`,
    solution: `def bilinear_transform(s, t):
    return (2.0 / t + s) / (2.0 / t - s)`,
    testCases: [
      { input: [0, 1], expected: 1.0 },
      { input: [1, 1], expected: 3.0 },
      { input: [1, 0.5], expected: 1.6666666666666667 },
      { input: [-2, 1], expected: 0.0 },
    ],
    hint: "s = 0 maps to z = 1 and s = -2/T maps to z = 0.",
  },
  {
    id: "ca-177",
    title: "Butterworth Order Calculation",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "The minimum Butterworth filter order meeting passband ripple Ap dB at wp and stopband attenuation As dB at ws is\n\nn = ceil( log10((10^(As/10) - 1) / (10^(Ap/10) - 1)) / (2 * log10(ws / wp)) )\n\nGiven As > Ap >= 0 and ws > wp > 0, return n as a float.",
    starterCode: `def butterworth_order(ap_db, as_db, wp, ws):
    # Your code here
    pass`,
    solution: `def butterworth_order(ap_db, as_db, wp, ws):
    import math
    num = 10 ** (as_db / 10.0) - 1.0
    den = 10 ** (ap_db / 10.0) - 1.0
    return float(math.ceil(math.log10(num / den) / (2.0 * math.log10(ws / wp))))`,
    testCases: [
      { input: [1, 20, 1, 2], expected: 5.0 },
      { input: [3, 40, 1, 2], expected: 7.0 },
      { input: [0.5, 30, 1, 4], expected: 4.0 },
      { input: [1, 10, 2, 4], expected: 3.0 },
    ],
    hint: "The magnitude-squared response of an n-th order Butterworth filter is 1/(1 + (w/wp)^(2n)).",
  },
  {
    id: "ca-178",
    title: "Bode Magnitude at Frequency",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "For the first-order low-pass transfer function H(s) = k / (s + a), the magnitude at frequency omega is |H(j*omega)| = k / sqrt(omega^2 + a^2).\n\nReturn the magnitude in decibels: 20*log10(|H|). Assume k > 0 and a >= 0.",
    starterCode: `def bode_magnitude_db(k, a, omega):
    # Your code here
    pass`,
    solution: `def bode_magnitude_db(k, a, omega):
    import math
    mag = k / math.sqrt(omega * omega + a * a)
    if mag <= 0:
        return float("-inf")
    return 20.0 * math.log10(mag)`,
    testCases: [
      { input: [1, 1, 0], expected: 0.0 },
      { input: [1, 1, 1], expected: -3.0102999566398125 },
      { input: [10, 1, 0], expected: 20.0 },
      { input: [1, 0, 2], expected: -6.020599913279624 },
      { input: [2, 3, 0], expected: -3.521825181113625 },
    ],
    hint: "At the corner frequency omega = a the magnitude drops by about 3 dB.",
  },
  {
    id: "ca-179",
    title: "Damping Ratio from Overshoot",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "For a second-order underdamped system with percent overshoot Mp (as a fraction), the damping ratio is\n\nzeta = -ln(Mp) / sqrt(pi^2 + ln(Mp)^2)\n\nGiven Mp in (0, 1), return zeta. A larger overshoot means a smaller damping ratio.",
    starterCode: `def damping_from_overshoot(mp):
    # Your code here
    pass`,
    solution: `def damping_from_overshoot(mp):
    import math
    lm = math.log(mp)
    return -lm / math.sqrt(math.pi * math.pi + lm * lm)`,
    testCases: [
      { input: [0.5], expected: 0.2154537619662468 },
      { input: [0.1], expected: 0.5911550337988976 },
      { input: [0.25], expected: 0.4037127519434207 },
      { input: [0.163], expected: 0.5000425292061115 },
    ],
    hint: "Mp = exp(-pi*zeta / sqrt(1 - zeta^2)) inverted gives this formula.",
  },
  {
    id: "ca-180",
    title: "Routh-Hurwitz Stability Check",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "The cubic s^3 + a2*s^2 + a1*s + a0 is Hurwitz stable if and only if all coefficients are positive and a2*a1 > a0.\n\nGiven a2, a1, and a0, return True when the polynomial is stable and False otherwise.",
    starterCode: `def routh_hurwitz_cubic(a2, a1, a0):
    # Your code here
    pass`,
    solution: `def routh_hurwitz_cubic(a2, a1, a0):
    return a2 > 0 and a1 > 0 and a0 > 0 and a2 * a1 > a0`,
    testCases: [
      { input: [3, 2, 1], expected: true },
      { input: [1, 2, 3], expected: false },
      { input: [0, 1, 1], expected: false },
      { input: [2, 1, 1], expected: true },
      { input: [1, 1, 1], expected: false },
    ],
    hint: "The Routh array's first column must have no sign changes.",
  },
  {
    id: "ca-181",
    title: "Root Locus Breakaway Point",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "For the open-loop transfer function G(s) = K / (s*(s + a)) with a > 0, the root locus branches meet at the breakaway point s = -a/2.\n\nReturn [s_break, K_break] where the gain K at that point is |s*(s + a)| evaluated at s_break, equal to a^2 / 4.",
    starterCode: `def root_locus_breakaway(a):
    # Return [s_breakaway, gain]
    # Your code here
    pass`,
    solution: `def root_locus_breakaway(a):
    s = -a / 2.0
    return [s, abs(s * (s + a))]`,
    testCases: [
      { input: [2], expected: [-1.0, 1.0] },
      { input: [4], expected: [-2.0, 4.0] },
      { input: [1], expected: [-0.5, 0.25] },
      { input: [3], expected: [-1.5, 2.25] },
    ],
    hint: "Maximize the gain K(s) = -s*(s + a) along the real axis between the two poles.",
  },
  {
    id: "ca-182",
    title: "Steady-State Error",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "For a unity-feedback loop with the type-0 plant G(s) = k / (s + a), the position error constant is Kp = k / a and the unit-step steady-state error is e_ss = 1 / (1 + Kp).\n\nGiven k >= 0 and a > 0, return e_ss.",
    starterCode: `def steady_state_step_error(k, a):
    # Your code here
    pass`,
    solution: `def steady_state_step_error(k, a):
    return 1.0 / (1.0 + k / a)`,
    testCases: [
      { input: [4, 2], expected: 0.3333333333333333 },
      { input: [0, 1], expected: 1.0 },
      { input: [1, 1], expected: 0.5 },
      { input: [10, 5], expected: 0.3333333333333333 },
    ],
    hint: "The final value theorem evaluates the error transfer function 1/(1 + G(s)) at s = 0.",
  },
  {
    id: "ca-183",
    title: "Residue Theorem Integral",
    category: "Calculus",
    difficulty: "Hard",
    description:
      "Evaluate the contour integral of 1 / ((z - a)*(z - b)) counterclockwise around the circle |z| = R with real poles a != b.\n\nBy the residue theorem the integral is 2*pi*i times the sum of residues at the poles inside the circle, where each simple pole contributes 1/(pole - other). Return the result as [real, imag].",
    starterCode: `def residue_integral(a, b, r):
    # Return [real, imag]
    # Your code here
    pass`,
    solution: `def residue_integral(a, b, r):
    import math
    total = 0.0
    if abs(a) < r:
        total += 1.0 / (a - b)
    if abs(b) < r:
        total += 1.0 / (b - a)
    return [0.0, 2.0 * math.pi * total]`,
    testCases: [
      { input: [1, 3, 2], expected: [0.0, -3.141592653589793] },
      { input: [1, 3, 4], expected: [0.0, 0.0] },
      { input: [3, 1, 2], expected: [0.0, -3.141592653589793] },
      { input: [2, 5, 1], expected: [0.0, 0.0] },
      { input: [0, 4, 3], expected: [0.0, -1.5707963267948966] },
    ],
    hint: "When both poles are inside, the two residues cancel because 1/(a-b) + 1/(b-a) = 0.",
  },
  {
    id: "ca-184",
    title: "Conjugate Harmonic Function",
    category: "Calculus",
    difficulty: "Hard",
    description:
      "The function u(x, y) = a*x^2 - a*y^2 + b*x*y is harmonic for every a, b. Its harmonic conjugate, normalized by v(0, 0) = 0, is\n\nv(x, y) = 2*a*x*y + (b/2)*(y^2 - x^2)\n\nGiven a, b, x, and y, return v(x, y). Then u + i*v is holomorphic.",
    starterCode: `def conjugate_harmonic(a, b, x, y):
    # Your code here
    pass`,
    solution: `def conjugate_harmonic(a, b, x, y):
    return 2.0 * a * x * y + (b / 2.0) * (y * y - x * x)`,
    testCases: [
      { input: [1, 0, 1, 1], expected: 2.0 },
      { input: [1, 2, 1, 0], expected: -1.0 },
      { input: [2, 0, 0, 3], expected: 0.0 },
      { input: [0, 4, 2, 1], expected: -6.0 },
    ],
    hint: "Integrate v_x = -u_y with respect to y and fix the integration constant with v_y = u_x.",
  },
  {
    id: "ca-185",
    title: "Digital Filter Step",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "Take one step of the first-order IIR filter y[n] = b0*x[n] + b1*x[n-1] - a1*y[n-1].\n\nGiven the current input x_n, the previous input x_prev, the previous output y_prev, and the coefficients b0, b1, a1, return y[n].",
    starterCode: `def digital_filter_step(x_n, x_prev, y_prev, b0, b1, a1):
    # Your code here
    pass`,
    solution: `def digital_filter_step(x_n, x_prev, y_prev, b0, b1, a1):
    return b0 * x_n + b1 * x_prev - a1 * y_prev`,
    testCases: [
      { input: [1, 0, 0, 1, 0, 0], expected: 1.0 },
      { input: [1, 1, 0, 1, 1, 0], expected: 2.0 },
      { input: [1, 1, 2, 0.5, -0.5, -1], expected: 2.0 },
      { input: [0, 1, 1, 1, 0, -0.5], expected: 0.5 },
    ],
    hint: "The feedback term enters with the sign of the difference-equation form, so subtract a1*y_prev.",
  },
];
